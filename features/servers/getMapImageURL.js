const getMapDir = (mapname) => {
    switch (mapname.toLowerCase()) {
        case "deathisland":
            return "https://static.wikia.nocookie.net/halo/images/0/04/Isla_2.jpg/revision/latest/top-crop/width/220/height/220?cb=20120226012948&path-prefix=es";

        case "beavercreek":
            return "https://static.wikia.nocookie.net/halo/images/6/61/Battle_CreekPC.JPG/revision/latest/scale-to-width-down/350?cb=20070705202826";

        case "chillout":
            return "https://static.wikia.nocookie.net/halo/images/2/2a/79220362729634319.jpg/revision/latest/scale-to-width-down/340?cb=20110630152316&path-prefix=es";

        case "ratrace":
            return "https://static.wikia.nocookie.net/halo/images/c/c3/RatRace.png/revision/latest?cb=20110326021303&path-prefix=es";

        case "bloodgulch":
            return "https://i.ytimg.com/vi/gbFVwhw8Wcs/mqdefault.jpg";

        case "gephyrophobia":
            return "https://static.wikia.nocookie.net/halo/images/0/00/Halo_CE_Gephyrophobia.jpg/revision/latest/scale-to-width-down/340?cb=20070604185719";

        case "hangemhigh":
            return "https://static.wikia.nocookie.net/halo/images/0/03/Hangemhigh.PNG/revision/latest?cb=20080514072638";

        case "boardingaction":
            return "https://static.wikia.nocookie.net/halo/images/1/11/BoardingAction.png/revision/latest?cb=20170414043015&path-prefix=es";

        case "damnation":
            return "https://static.wikia.nocookie.net/halo/images/1/1d/DamnationPC.JPG/revision/latest?cb=20070705204750";

        case "carousel":
            return "https://www.halopedia.org/images/thumb/5/52/Halo_CE_Derelict.jpg/1200px-Halo_CE_Derelict.jpg";

        case "prisoner":
            return "https://static.wikia.nocookie.net/halo/images/3/37/Prisoner.jpg/revision/latest?cb=20110706020746&path-prefix=es";

        case "dangercanyon":
            return "https://www.halopedia.org/images/thumb/e/e8/Halo_Combat_Evolved-Danger_Canyon.jpg/1200px-Halo_Combat_Evolved-Danger_Canyon.jpg";

        case "icefields":
            return "https://www.halopedia.org/images/thumb/d/db/Halo_Combat_Evolved-Ice_Fields.jpg/1200px-Halo_Combat_Evolved-Ice_Fields.jpg";

        case "infinity":
            return "https://www.halopedia.org/images/thumb/b/bb/Halo_Combat_Evolved-Infinity.jpg/1200px-Halo_Combat_Evolved-Infinity.jpg";

        case "longest":
            return "https://static.wikia.nocookie.net/halo/images/0/05/Longest2.jpg/revision/latest?cb=20060724232238";

        case "sidewinder":
            return "https://i.ytimg.com/vi/CQxcV48pa5A/maxresdefault.jpg";

        case "timberland":
            return "https://www.halopedia.org/images/thumb/5/53/Halo_Combat_Evolved-Timberland.jpg/1200px-Halo_Combat_Evolved-Timberland.jpg";

        case "wizard":
            return "https://static.wikia.nocookie.net/halo/images/c/c7/Wizard.png/revision/latest?cb=20110716200853&path-prefix=es";

        case "bigassv2,104":
            return "http://hce.halomaps.org/images/files/lg/38screenshot00-39.jpg";

        case "putput":
            return "https://static.wikia.nocookie.net/halo/images/3/31/Chiron_TL-34.JPG/revision/latest?cb=20070705204136";

        default:
            return "https://images.idgesg.net/images/article/2020/08/one_large_glowing_question_mark_surrounded_by_many_small_question_marks_questions_doubts_unknown_by_carloscastilla_gettyimages-1188952754_cso_nw_2400x1600-100854972-large.jpg";

    }
}

module.exports = {
    getMap: getMapDir
}