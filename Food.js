// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: magic;

async function run()
{
    let upc = args.shortcutParameter

    if (config.runsInApp) upc = "49000036756" // for testing inside the app

    var foodInfo = await requestNx(upc)

    foodInfo = await requestEd(upc)

    foodInfo = await requestUf(upc)
    
    Script.setShortcutOutput(foodInfo)

    Script.complete()
}

await run()

async function requestNx(upc)
{
    let url = "https://nutritionix-api.p.rapidapi.com/v1_1/item?upc=" + upc
    let host = "nutritionix-api.p.rapidapi.com"
    
    var jInfo = await request(url, upc, host, "nx")

    return jInfo
}

async function requestEd(upc)
{
    let url = "https://edamam-food-and-grocery-database.p.rapidapi.com/parser?upc=" + upc
    let host = "edamam-food-and-grocery-database.p.rapidapi.com"

    var jInfo = await request(url, upc, host, "ed")

    return jInfo
}

async function requestUf(upc)
{
    let url = "https://upcfood.p.rapidapi.com/v1.0/product.cfm?upc=" + upc + "&apiKey=f41cf300-bb18-11eb-8918-005056a6fcdc&Format=jSon"
    let host = "upcfood.p.rapidapi.com"

    var jInfo = await request(url, upc, host, "uf")

    return jInfo
}

async function request(url, upc, host, ext)
{
    const fm = FileManager.iCloud()
    let fileName = upc + "." + ext + ".js"
    let filePath = fm.documentsDirectory() + "/storage" + "/" + fileName

    var jInfo

    console.log("************")

    if(fm.fileExists(filePath))
    {
        console.log("file found: " + fileName)

        jInfo = JSON.parse(fm.readString(filePath))

        console.log(jInfo)

        return jInfo
    }

    var req = new Request(url)

    req.headers = { "x-rapidapi-key": "16e2c1a827msh446d04107881719p157391jsn1e65b9bed8af",
    "x-rapidapi-host": host}

    try {
        console.log("request sent: " + JSON.stringify(req))
        jInfo = await req.loadJSON()

    } catch (error) {
        console.log(error)
        return
    }

    console.log(jInfo)

    fm.writeString(filePath, JSON.stringify(jInfo))

    return jInfo
}
