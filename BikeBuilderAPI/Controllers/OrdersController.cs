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
        private readonly AccountsContext _db;

        public OrdersController(AccountsContext db)
        {
            _db = db;
        }
        public class DeleteOrderRequest
        {
            public int OrderID { get; set; }
        }



        [HttpPost("create")]
        public async Task<IActionResult> CreateOrder([FromBody] Order order)
        {
            order.OrderID = 0;
            order.OrderNumber = GenerateOrderNumber();
            order.CreatedAt = DateTime.UtcNow;
            order.EstimatedDeliveryDate = DateTime.UtcNow.AddDays(7);

            if (order.TotalPrice <= 0)
                return BadRequest("Invalid order total");

            _db.Orders.Add(order);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                order.OrderID,
                order.OrderNumber
            });
        }

        private string GenerateOrderNumber()
        {
            return $"MTB-{DateTime.UtcNow.Year}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
        }

        [HttpPost("delete")]
        public async Task<IActionResult> DeleteOrder([FromBody] DeleteOrderRequest req)
        {
            var order = await _db.Orders.FindAsync(req.OrderID);

            if (order == null)
                return NotFound();

            if (DateTime.UtcNow < order.EstimatedDeliveryDate)
                return BadRequest("Order not delivered yet");

            _db.Orders.Remove(order);
            await _db.SaveChangesAsync();

            return Ok();
        }

        [HttpPost("export")]
        public IActionResult ExportUserOrders([FromBody] int accountId)
        {
            UserOrderExporter.ExportOrdersToJson(accountId, _db);
            return Ok();
        }

    }


}
