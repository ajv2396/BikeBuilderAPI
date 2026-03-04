/*
    OrdersController.cs

    This controller handles order creation, deletion, and export for the Bike
    Builder system. It exposes three endpoints: one to create a new order record
    in the database with an auto-generated order number and delivery date, one to
    delete a delivered order (only permitted after the estimated delivery date has
    passed), and one to re-export the user's orders to a JSON file for the front end.
    The AccountsContext is injected via the constructor for database access.
*/

using BikeBuilderAPI.Model;
using BikeBuilderAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BikeBuilderAPI.Controllers
{
    [ApiController]
    [Route("api/orders")]
    public class OrdersController : ControllerBase
    {
        // Database context injected by the ASP.NET dependency injection system
        private readonly AccountsContext _db;

        public OrdersController(AccountsContext db)
        {
            _db = db;
        }

        // Request model for identifying which order to delete
        public class DeleteOrderRequest
        {
            public int OrderID { get; set; }
        }

        // Creates a new order record in the database
        // Auto-assigns an order number, placement timestamp, and estimated delivery date (7 days from now)
        [HttpPost("create")]
        public async Task<IActionResult> CreateOrder([FromBody] Order order)
        {
            // Reset the ID so the database assigns a new one rather than using a client-provided value
            order.OrderID = 0;
            order.OrderNumber = GenerateOrderNumber();
            order.CreatedAt = DateTime.UtcNow;
            // Set delivery estimate to 7 days from the order placement date
            order.EstimatedDeliveryDate = DateTime.UtcNow.AddDays(7);

            // Reject orders with an invalid total price
            if (order.TotalPrice <= 0)
                return BadRequest("Invalid order total");

            _db.Orders.Add(order);
            await _db.SaveChangesAsync();

            // Return the generated order ID and order number to the front end for confirmation display
            return Ok(new
            {
                order.OrderID,
                order.OrderNumber
            });
        }

        // Generates a unique order number in the format "MTB-YEAR-XXXXXX"
        // Uses the first 6 characters of a GUID to create a short, unique identifier
        private string GenerateOrderNumber()
        {
            return $"MTB-{DateTime.UtcNow.Year}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
        }

        // Deletes an order from the database
        // Only allows deletion if the estimated delivery date has passed (i.e. the order has been delivered)
        [HttpPost("delete")]
        public async Task<IActionResult> DeleteOrder([FromBody] DeleteOrderRequest req)
        {
            var order = await _db.Orders.FindAsync(req.OrderID);

            if (order == null)
                return NotFound();

            // Prevent deletion of orders that have not yet been delivered
            if (DateTime.UtcNow < order.EstimatedDeliveryDate)
                return BadRequest("Order not delivered yet");

            _db.Orders.Remove(order);
            await _db.SaveChangesAsync();

            return Ok();
        }

        // Re-exports all orders for a given account ID to the user_orders.json file
        // Called by the front end after an order is created or deleted to keep the JSON in sync
        [HttpPost("export")]
        public IActionResult ExportUserOrders([FromBody] int accountId)
        {
            UserOrderExporter.ExportOrdersToJson(accountId, _db);
            return Ok();
        }
    }
}