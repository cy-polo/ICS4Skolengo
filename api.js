const config = require("./config.json");
const fetch = require("node-fetch");

let token = "";
let schoolId = "";

exports.entClient = class entClient {
    async loginByCredentials(username, password) {
        const connexion = await sendRequest(`activation/${username}/${password}`);

        if (!connexion.success) return false;
        token = connexion.authtoken;
        return true;
    }

    async loginByToken(givenToken) {
        token = givenToken;
        try {
            const info = await sendRequest("infoutilisateur");

            if (info.errmsg === null) {
                schoolId = info.idEtablissementSelectionne;
                
                return true;
            }
            else return false;
        } catch {
            return false;
        }
    }

    loginByTokenWithoutVerification(givenToken, givenSchoolId) {
        token = givenToken;
        schoolId = givenSchoolId;
    }

    getToken() {
        return token;
    }

    async getNews() {
        return await sendRequest(`actualites/idetablissement/${schoolId}`);
    }

    async getNewsById(id) {
        return await sendRequest(`mobilite/contenuArticle/article/${id}`);
    }

    async getInfo() {
        return await sendRequest("infoutilisateur");
    }

    async getWork() {
        return await sendRequest(`travailAFaire/idetablissement/${schoolId}`);
    }

    async getWorkById(uIdSeance, uId) {
        return await sendRequest(`contenuActivite/idetablissement/${schoolId}/${uIdSeance}/${uId}`);
    }

    async getCalendar() {
        return await sendRequest(`calendrier/idetablissement/${schoolId}`);
    }

    async getMessage() {
        return await sendRequest("messagerie/boiteReception");
    }

    async getUnreadMessage() {
        const request = await sendRequest("messagerie/info");
        return request.nbMessagesNonLus;
    }

    async getLack() {
        return await sendRequest(`consulterAbsences/idetablissement/${schoolId}`);
    }

    async getGrade() {
        return await sendRequest(`consulterNotes/idetablissement/${schoolId}`);
    }

    async getTranscript() {
        return await sendRequest(`consulterReleves/idetablissement/${schoolId}`);
    }

    async logout() {
        const logout = await sendRequest("desactivation");
        return logout.success;
    }
};

async function sendRequest(path) {
    return await fetch(`https://mobilite.${config.REMOTE_ENT_API}/mobilite/${path}/?_=${Date.now()}`, {
        headers: {
            Accept: "application/json, text/javascript, */*; q=0.01",
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
            "Accept-Language": "fr-fr",
            "X-Kdecole-Auth": token,
            "X-Kdecole-Vers": "3.7.10",
            cookie: "SERVERID=REDACTED-prod-web14"
        }
    })
    .then(res => res.json())
    .catch(() => {
        // Default Object to avoid errors from the API file

        return {
            success: false,
            errmsg: false,
            nbMessagesNonLus: false
        }
    });
};