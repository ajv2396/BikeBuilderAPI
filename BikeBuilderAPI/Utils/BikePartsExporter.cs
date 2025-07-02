using System.Text.Json;
using BikeBuilderAPI.Model;

public static class BikePartsExporter
{
    public static void ExportBikePartsToJson(AccountsContext db)
    {
        var EnduroParts = db.BikeParts
            .Where(b => b.bike_type_id == 1)
            .ToList();

        var SaveItems = EnduroParts.Select(b => new
        {
            b.id,
            b.bike_type_id,
            b.part_type,
            b.name,
            b.description,
            b.image_path,
            b.thumbnail_path,
            b.price
        }).ToList();

        var json = JsonSerializer.Serialize(SaveItems, new JsonSerializerOptions { WriteIndented = true });

        var filePath = Path.Combine("wwwroot", "enduro_parts.json");
        File.WriteAllText(filePath, json);
    }
}
