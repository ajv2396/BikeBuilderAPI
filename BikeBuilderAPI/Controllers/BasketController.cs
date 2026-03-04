/*
    BasketController.cs

    This controller manages the user's basket, which is stored as a JSON file
    on the server (user-basket.json) rather than in the database. It exposes
    three endpoints: one to add a configured bike to the basket, one to remove
    a specific basket item by ID, and one to clear the entire basket. The basket
    file path is resolved at construction time using the web root environment path.
*/

using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Text.Json.Serialization;
using BikeBuilderAPI.Utils;
using Microsoft.AspNetCore.Mvc;

namespace BikeBuilderAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BasketController : ControllerBase
    {
        // Full path to the basket JSON file, resolved from the web root at startup
        private readonly string BasketFile;

        // Resolves the basket file path using the injected web host environment
        public BasketController(IWebHostEnvironment env)
        {
            BasketFile = Path.Combine(env.WebRootPath, "basket", "user-basket.json");
        }

        // Represents a single basket entry, linking an account to a configured bike
        public class BikeItem
        {
            public int Id { get; set; }         // Unique basket item ID, assigned on add
            public int AccountId { get; set; }  // The account this basket item belongs to
            public BikeDetails Bike { get; set; }
        }

        // Contains all selected part IDs and the calculated total price for one bike build
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
            public int Total { get; set; }
        }

        // Request model for the delete endpoint, identifying which item to remove
        public class RemoveBasketItemRequest
        {
            public int Id { get; set; }
        }

        // Adds a new bike item to the basket JSON file
        // Reads the existing basket, assigns the next sequential ID, appends the item, and saves
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

                // Assign the next ID by incrementing the last item's ID, or start at 1 if empty
                //make the next id
                int nextId = 1;
                if (basket.Count > 0)
                {
                    nextId = basket[^1].Id + 1;
                }

                newItem.Id = nextId;
                basket.Add(newItem);

                // Serialise the updated basket back to the JSON file with indented formatting
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

        // Removes a specific basket item from the JSON file by its ID
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
                // Deserialise existing basket, defaulting to an empty list if null
                var basket = JsonSerializer.Deserialize<List<BikeItem>>(json)
                             ?? new List<BikeItem>();

                // Find the item to remove by its basket ID
                var itemToRemove = basket.Find(b => b.Id == request.Id);

                if (itemToRemove == null)
                {
                    return NotFound("Basket item not found");
                }

                basket.Remove(itemToRemove);

                // Write the updated basket back to the file
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

        // Clears the entire basket by resetting the JSON file to an empty array
        // Called by checkout-script.js after an order is successfully placed
        [HttpPost("clear")]
        public IActionResult ClearBasket()
        {
            ClearUserBasket.Clear();
            return Ok();
        }
    }
}