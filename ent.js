const express = require("express");
const { convert } = require("html-to-text");

const app = express();

const config = require("./config.json");
const { entClient } = require("./api.js");
const { createEvents } = require("ics");
const { writeFileSync } = require("fs");

// Cache the data to reduce the number of requests
let dictionary = { };

app.get("/calendar.ics", async(req, res) => {
  const token = req.query.token;
  if (!token) return res.sendStatus(403);

  const ent = new entClient();

  let user = getValue(`TOKEN-${token}`);
  if (!user) {
    const login = await ent.loginByToken(token);
    if (!login) return res.sendStatus(403);
    
    const info = await ent.getInfo();

    user = {
      name: info.nom,
      schoolId: info.idEtablissementSelectionne,
      nextUpdate: 0
    }

    setValue(`TOKEN-${token}`, user);
  } else ent.loginByTokenWithoutVerification(token, user.schoolId);

  console.log(`[Calendrier] : ${user.name} vient de générer le calendrier le ${new Date().toLocaleString("fr-FR")} (cache : ${user.nextUpdate > Date.now() ? "oui" : "non"})`);

  // Calendar update allowed every 5 minutes
  if (user.nextUpdate > Date.now()) {
    // TODO: use user ID instead of name (to avoid conflicts)
    return res.sendFile(__dirname + `/calendars/${user.name}.ics`);
  } else user.nextUpdate = Date.now() + 300000;

  setValue(`TOKEN-${token}`, user);

  const calendar = await ent.getCalendar();

  let calendarArr = [ ];

  const work = await ent.getWork();
  let workObj = { };

  for (let day of work.listeTravaux) {
    for (let seance of day.listTravail) {
      const activity = await ent.getWorkById(seance.uidSeance, seance.uid);

      workObj[seance.uidSeance] = activity;
    }
  }

  for (let day of calendar.listeJourCdt) {
    if (day == null) continue;

    for (let seance of day.listeSeances) {
      if (seance == null) continue;

      let description = "Vous n'avez pas de travail à faire pour ce cours.\n\n";
      const workSeance = workObj[seance.idSeance];

      if (workSeance) {
        const content = convert(workSeance.codeHTML, { wordwrap: false });

        description = `Travail à faire :\n  Titre : ${workSeance.titre}\n  Contenu : ${content.length == 0 ? "Aucun contenu" : content}\n\n`;
      }
      
      if (removeTime().getTime() > removeTime(new Date(seance.hfin)).getTime()) description = "Travail à faire :\n  La date est passée, il n'est donc plus possible de voir le travail à faire pour ce cours.\n\n";

      if (seance.enSeance != null) {
        const inClass = await ent.getWorkById(seance.idSeance, seance.enSeance[0].uid);
        const content = convert(inClass.codeHTML, { wordwrap: false });

        description += `Contenu du cours :\n  Titre : ${inClass.titre}  \n  Contenu : ${content.length == 0 ? "Aucun contenu" : content}\n\n`;
      }

      description += `© ${new Date().getFullYear()} par cy-polo `;

      let timeStart = new Date(seance.hdeb);
      let timeEnd = dateDiff(new Date(seance.hdeb), new Date(seance.hfin));

      let status;
      if (seance.flagActif) status = "CONFIRMED";
      else status = "CANCELLED";

      calendarArr.push({
        title: `${seance.matiere} ${workSeance ? "💼" : ""}`,
        description: description,
        location: seance.salle.split("-")[0],
        status: status,
        start: [ timeStart.getFullYear(), timeStart.getMonth() + 1, timeStart.getDate(), timeStart.getHours(), timeStart.getMinutes() ],
        duration: { hours: timeEnd.hour, minutes: timeEnd.min }
      });
  }};

  const { value } = createEvents(calendarArr);

  // TODO: use user ID instead of name (to avoid conflicts)
  writeFileSync(`./calendars/${user.name}.ics`, value);
  return res.sendFile(__dirname + `/calendars/${user.name}.ics`);
});

app.get("/token", async(req, res) => {
  const username = req.query.user;
  const password = req.query.pass;

  // Need to check if username or password is undefined

  if (username === "" || password === "") return res.sendFile(__dirname + "/invalidPassword.html");

  const ent = new entClient();

  const login = await ent.loginByCredentials(username, password);
  if (!login) return res.sendFile(__dirname + "/invalidPassword.html");
  
  const info = await ent.getInfo();
  console.log(`[Connexion] : ${info.nom} vient de se connecter le ${new Date().toLocaleString("fr-FR")}`);
  setValue(`TOKEN-${ent.getToken()}`, {
    name: info.nom,
    schoolId: info.idEtablissementSelectionne,
    nextUpdate: 0
  });

  return res.send(`Le lien du calendrier est : http://${config.LOCAL_ICS_IP}:${config.LOCAL_ICS_PORT}/calendar.ics?token=${ent.getToken()}`);
});

app.get("/login", async(req, res) => {
  return res.sendFile(__dirname + "/login.html");
});

app.listen(config.LOCAL_ICS_PORT, () => {
  console.log("Le serveur est en ligne !");
});

function dateDiff(date1, date2) {
  let diff = { }
  let tmp = date2 - date1;
  
  tmp = Math.floor(tmp / 1000);
  diff.sec = tmp % 60;
  
  tmp = Math.floor((tmp - diff.sec) / 60);
  diff.min = tmp % 60;

  tmp = Math.floor((tmp - diff.min) / 60);
  diff.hour = tmp % 24;

  tmp = Math.floor((tmp - diff.hour) /24);
  diff.day = tmp;
  
  return diff;
};

function removeTime(date = new Date()) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
};

function setValue(key, value) {
  dictionary[key] = value;
};

function getValue(key) {
  return dictionary[key];
};