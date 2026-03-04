/*
    BikePartsExporter.cs

    This utility class exports bike parts data from the database to three separate
    JSON files in wwwroot/bike-parts/, one for each bike type (Enduro, Downhill,
    Dirt Jumper). These JSON files are read directly by the front end when loading
    the builder and part details pages, avoiding repeated database queries during
    normal use. This export is run once at application startup via Program.cs.
*/

using System.Text.Json;
using BikeBuilderAPI.Model;

public static class BikePartsExporter
{
    // Queries the database and writes separate JSON files for each bike type's parts
    public static void ExportBikePartsToJson(AccountsContext db)
    {
        //----------------------------------ENDURO PARTS----------------------------------

        // Query all parts with BikeTypeId == 1 (Enduro)
        var EnduroParts = db.BikeParts
            .Where(b => b.BikeTypeId == 1)
            .ToList();

        // Project to an anonymous type containing only the fields needed by the front end
        var SaveItemsEnduro = EnduroParts.Select(b => new
        {
            b.Id,
            b.BikeTypeId,
            b.PartType,
            b.Name,
            b.Description,
            b.ImagePath,
            b.ThumbnailPath,
            b.Price,
            b.Weight
        }).ToList();

        var json1 = JsonSerializer.Serialize(SaveItemsEnduro, new JsonSerializerOptions { WriteIndented = true });
        var filePath1 = Path.Combine("wwwroot", "bike-parts", "enduro_parts.json");
        File.WriteAllText(filePath1, json1);

        //----------------------------------DH PARTS----------------------------------

        // Query all parts with BikeTypeId == 2 (Downhill)
        var DHParts = db.BikeParts
            .Where(b => b.BikeTypeId == 2)
            .ToList();

        var SaveItemsDH = DHParts.Select(b => new
        {
            b.Id,
            b.BikeTypeId,
            b.PartType,
            b.Name,
            b.Description,
            b.ImagePath,
            b.ThumbnailPath,
            b.Price,
            b.Weight
        }).ToList();

        var json2 = JsonSerializer.Serialize(SaveItemsDH, new JsonSerializerOptions { WriteIndented = true });
        var filePath2 = Path.Combine("wwwroot", "bike-parts", "dh_parts.json");
        File.WriteAllText(filePath2, json2);

        //----------------------------------DJ PARTS----------------------------------

        // Query all parts with BikeTypeId == 3 (Dirt Jumper)
        var DJParts = db.BikeParts
            .Where(b => b.BikeTypeId == 3)
            .ToList();

        var SaveItemsDJ = DJParts.Select(b => new
        {
            b.Id,
            b.BikeTypeId,
            b.PartType,
            b.Name,
            b.Description,
            b.ImagePath,
            b.ThumbnailPath,
            b.Price,
            b.Weight
        }).ToList();

        var json3 = JsonSerializer.Serialize(SaveItemsDJ, new JsonSerializerOptions { WriteIndented = true });
        var filePath3 = Path.Combine("wwwroot", "bike-parts", "dj_parts.json");
        File.WriteAllText(filePath3, json3);
    }
}