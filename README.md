# ICS4Skolengo

ICS4Skolengo is an API for obtaining your schedule in ICS format.  
From your personal link, you can integrate it into your favorite application (Apple Calendar, Google Calendar...) to view your schedule in real time (this requires your device to update the calendar regularly).

ENT is a French acronym that stands for "Environnement Numérique de Travail" (digital work environment).  
I've done this work on my own, for friends. To achieve this result, I had to decompile the mobile application and I also analyzed and decrypted the HTTPS requests.

The advantages are:
- you don't have to waste time opening the horrible app or logging on to the website
- you can use widgets compatible with your device to display your calendar
- you can use Siri or Google Assistant to get your calendar
- the work to be done and the content of the course sessions are in the description of each course
- the 💼 emoji is placed directly after the session name if there is homework to do

The disadvantages are:
- you cannot obtain your timetable more than 2 weeks in advance (ENT server limitation)
- you can't be logged on to the mobile app and use the calendar at the same time, as the temporary password only works once (there's a way to bypass this restriction by watching your mobile's HTTP/S traffic while browsing the app, looking directly for the token)

## Overview in Apple Calendar (screenshots from one of my friend)

Global view:  
<img src="https://cdn.discordapp.com/attachments/678566839214931969/1140295224250339379/WhatsApp_Image_2023-08-13_at_16.31.17.jpeg" width="250">  

Course data:  
<img src="https://cdn.discordapp.com/attachments/678566839214931969/1140295270157004940/WhatsApp_Image_2023-08-13_at_16.31.42.jpeg" width="250">

## Requirements

You must have [Node JS](https://nodejs.org/en/) and an access to one of the [Skolengo domain](#list-of-skolengos-domains).

## Usage

Clone this project, install dependencies using `npm install`, complete the `config.json` file (`REMOTE_ENT_API` is for the [Skolengo domain](#list-of-skolengos-domains), `LOCAL_ICS_IP` is your private/public IP and `LOCAL_ICS_PORT` is the port for the server). Run the project using `node ent.js`.

Open `127.0.0.1:3000/login` on your browser, according to your config.  
Log in using the temporary identifiers obtained from the website (parameter > mobile application to obtain them).
You'll get a link containing your ENT server authentication token. Sharing your token gives you access to your account.

All you have to do is subscribe to this URL from a calendar application (for Google Calendar, you have to go to the website to subscribe, not the application).

## List of Skolengo's domains

Credit to [maelgangloff/kdecole-api](https://github.com/maelgangloff/kdecole-api#liste-des-ent-support%C3%A9s-).

| Name                         | Domain                          |
|------------------------------|---------------------------------|
| Mon Bureau Numérique         | monbureaunumerique.fr           |
| Mon ENT Occitanie            | mon-ent-occitanie.fr            |
| Arsène 76                    | arsene76.fr                     |
| ENT27                        | ent27.fr                        |
| ENT Creuse                   | entcreuse.fr                    |
| ENT Auvergne-Rhône-Alpes     | ent.auvergnerhonealpes.fr       |
| Agora 06                     | agora06.fr                      |
| CyberCollèges 42             | cybercolleges42.fr              |
| eCollège 31 Haute-Garonne    | ecollege.haute-garonne.fr       |
| Mon collège en Val d'Oise    | moncollege.valdoise.fr          |
| Webcollège Seine-Saint-Denis | webcollege.seinesaintdenis.fr   |
| Eclat-BFC                    | eclat-bfc.fr                    |
| @ucollège84                  | aucollege84.vaucluse.fr         |
| ENT Val de Marne             | entvaldemarne.skolengo.com      |
| Skolengo                     | skolengo.com                    |
| Kosmos Éducation             | kosmoseducation.com             |
| Skolengo-Collèges et Lycées  | pdl.kosmoseducation.com         |
| Schulportal Ostbelgien       | schulen.be                      |