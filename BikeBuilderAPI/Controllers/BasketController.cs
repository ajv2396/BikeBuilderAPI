using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Collections.Generic;

namespace BikeBuilderAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BasketController : ControllerBase
    {
        private readonly string BasketFile;

        public BasketController(IWebHostEnvironment env)
        {
            BasketFile = Path.Combine(env.WebRootPath, "basket", "user-basket.json");
        }

        public class BikeItem
        {
            public int Id { get; set; }
            public int AccountId { get; set; }
            public BikeDetails Bike { get; set; }
        }

        public class BikeDetails
        {
            public int BikeType { get; set; }
            public int Frame { get; set; }
            public int Shock { get; set; }
            public int Fork { get; set; }
            public int Wheels { get; set; }
            public int Tyres { get; set; }
            public int Drivetrain { get; set; }
            public int Brakes { get; set; }
            public int Seatpost { get; set; }
            public int Saddle { get; set; }
            public int Bars { get; set; }
            public int Stem { get; set; }
            public int Pedals { get; set; }
        }
        public class RemoveBasketItemRequest
        {
            public int Id { get; set; }
        }

        [HttpPost("add")]
        public IActionResult AddToBasket([FromBody] BikeItem newItem)
        {
            try
            {
                List<BikeItem> basket = new List<BikeItem>();

                //read existing file if it exists
                if (System.IO.File.Exists(BasketFile))
                {
                    string json = System.IO.File.ReadAllText(BasketFile);
                    if (!string.IsNullOrWhiteSpace(json))
                    {
                        basket = JsonSerializer.Deserialize<List<BikeItem>>(json);
                    }
                }

                //make the next id
                int nextId = 1;
                if (basket.Count > 0)
                {
                    nextId = basket[^1].Id + 1;
                }

                newItem.Id = nextId;
                basket.Add(newItem);

                var options = new JsonSerializerOptions { WriteIndented = true };
                string updatedJson = JsonSerializer.Serialize(basket, options);
                System.IO.File.WriteAllText(BasketFile, updatedJson);

                return Ok(new { message = "Bike added to basket!", Id = newItem.Id });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("delete")]
        public IActionResult RemoveFromBasket([FromBody] RemoveBasketItemRequest request)
        {
            try
            {
                if (!System.IO.File.Exists(BasketFile))
                {
                    return NotFound("Basket file not found");
                }

                string json = System.IO.File.ReadAllText(BasketFile);
                var basket = JsonSerializer.Deserialize<List<BikeItem>>(json)
                             ?? new List<BikeItem>();

                var itemToRemove = basket.Find(b => b.Id == request.Id);

                if (itemToRemove == null)
                {
                    return NotFound("Basket item not found");
                }

                basket.Remove(itemToRemove);

                var options = new JsonSerializerOptions { WriteIndented = true };
                string updatedJson = JsonSerializer.Serialize(basket, options);
                System.IO.File.WriteAllText(BasketFile, updatedJson);

                return Ok(new { message = "Item removed from basket" });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

    }
}
