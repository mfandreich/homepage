import cryptoJS from "crypto-js";

class KeeneticApi {

  constructor(ip, login, pass) {
    this.ip = ip;
    this.login = login;
    this.pass = pass;
    this.headers = new Headers({ "Content-Type": "application/json" });
  }

  #updateHeadersFromResponse(response) {
    const cookie = response.headers.get("Set-Cookie");
    if (cookie) {
      this.headers.set("Cookie", cookie);
    }
  }

  async keenRequest(query, post = null){
    const url = `http://${this.ip}/${query}`;

    const options = {
      headers: this.headers,
      method: post ? "POST" : "GET",
    };

    if (post) {
      options.body = JSON.stringify(post);
    }

    const response = await fetch(url, options);

    this.#updateHeadersFromResponse(response);

    return response;
  }

  async keenRequestData(query, post = null){
    let response = await this.keenRequest(query, post);
    return JSON.parse(await response.text());
  }

  async keenAuth(){
    let response = await this.keenRequest("auth");

    if (response.status === 401) {
      const realm = response.headers.get("X-NDM-Realm");
      const challenge = response.headers.get("X-NDM-Challenge");

      const md5 = cryptoJS
        .MD5(`${this.login}:${realm}:${this.pass}`)
        .toString();
      const sha = cryptoJS.SHA256(`${challenge}${md5}`).toString();

      response = await this.keenRequest("auth", {
        login: this.login,
        password: sha,
      });

      return response.status === 200;
    }

    return response.status === 200;
  }
}

export default KeeneticApi;
