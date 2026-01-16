using System.Text.Json;
using BikeBuilderAPI.Model;

public static class UserOrderExporter
{
    //for sending specific user ordesr to json using logged in account id
    public static void ExportOrdersToJson(int accountId, AccountsContext db)
    {
        var UserOrders = db.Orders
            .Where(b => b.AccountID == accountId)
            .ToList();

        var OrderItems = UserOrders.Select(b => new
        {
            b.OrderID,
            b.AccountID,
            b.OrderNumber,
            b.TotalPrice,
            b.CreatedAt,
            b.EstimatedDeliveryDate
        }).ToList();

        var json = JsonSerializer.Serialize(OrderItems, new JsonSerializerOptions { WriteIndented = true });

        var filePath = Path.Combine("wwwroot", "user_orders.json");
        File.WriteAllText(filePath, json);
    }
}
