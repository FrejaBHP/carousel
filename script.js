function SideTing() {
    $("#spanAge").text(CalculateAge());

    $("#divSPInside").css("height", $("#albumSP").css("height"));
    $("#divFPInside").css("height", $("#albumFP").css("height"));
}



function CalculateAge() {
    let time = new Date();
    let year = time.getFullYear();
    let month = time.getMonth();
    let day = time.getDate();

    let initAge = year - 1997;
    let agedThisYear = false;
    if (month == 7) {
        if (day => 25) {
            agedThisYear = true;
        }
    }
    else if (month > 7) {
        agedThisYear = true;
    }

    return initAge - 1 + Number(agedThisYear);
}

SideTing();