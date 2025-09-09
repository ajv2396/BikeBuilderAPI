using System.Text.Json;
using BikeBuilderAPI.Model;

public static class BikePartsExporter
{
    public static void ExportBikePartsToJson(AccountsContext db)
    {
        //----------------------------------ENDURO PARTS----------------------------------
        var EnduroParts = db.BikeParts
            .Where(b => b.BikeTypeId == 1)
            .ToList();

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
