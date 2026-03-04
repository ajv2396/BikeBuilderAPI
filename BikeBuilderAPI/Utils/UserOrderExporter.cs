/*
    UserOrderExporter.cs

    This utility class exports a specific user's orders from the database to
    user_orders.json in the wwwroot directory. It filters by account ID so
    only the logged-in user's orders are written to the file. It is called
    after login, after a new order is placed, and after an order is deleted,
    keeping the JSON file in sync with the database at all times.
*/

using System.Text.Json;
using BikeBuilderAPI.Model;

public static class UserOrderExporter
{
    //for sending specific user orders to json using logged in account id
    // Queries all orders for the given account ID and writes them to user_orders.json
    public static void ExportOrdersToJson(int accountId, AccountsContext db)
    {
        // Filter orders to only those belonging to the logged-in user
        var UserOrders = db.Orders
            .Where(b => b.AccountID == accountId)
            .ToList();

        // Project to an anonymous type containing only the fields needed by the front end
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