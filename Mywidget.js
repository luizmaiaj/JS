// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: magic;

let gAqi = await loadAQI()
let gCovid = await loadCovid()

let widget = await createWidget(gAqi)
Script.setWidget(widget)

async function createWidget(iAqi)
{
    let widget = new ListWidget()

    widget.addText(iAqi)
    
    return widget
}

async function loadAQI()
{
    let url = "https://api.weatherbit.io/v2.0/current/airquality?lat=13.810061&lon=100.547316&key=9706b562b7964206946dceb916acc290"
    let req = new Request(url)
    let jreq = await req.loadJSON()

    return jreq.data[0].aqi
}

async function loadCovid()
{
    let url = "https://covid-19-data.p.rapidapi.com/country/code?code=TH"
    let req = new Request(url)

    req.headers({
        "x-rapidapi-key": "16e2c1a827msh446d04107881719p157391jsn1e65b9bed8af",
        "x-rapidapi-host": "coronavirus-smartable.p.rapidapi.com",
        "useQueryString": true
    });

    let jreq = await req.loadJSON()

    console.log(jreq)

    return jreq
}

Script.complete()