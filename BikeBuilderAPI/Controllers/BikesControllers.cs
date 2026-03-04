/*
    BikesControllers.cs

    This controller handles saving and deleting user bike configurations in the
    database. It exposes two endpoints: one to save a new configured bike build
    linked to a user account, and one to delete a previously saved bike by its ID.
    The AccountsContext is injected via the constructor for database access.
*/

using BikeBuilderAPI.Model;
using BikeBuilderAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLitePCL;
using System.IO;
using System.Security.Cryptography.X509Certificates;
using System.Text.Json;

namespace BikeBuilderAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BikesController : ControllerBase
    {
        // Database context injected by the ASP.NET dependency injection system
        private readonly AccountsContext _db;

        public BikesController(AccountsContext db)
        {
            _db = db;
        }

        // Saves a new bike configuration to the database linked to the user's account ID
        // Logs the incoming data to the console for debugging purposes
        [HttpPost("save-bike")]
        public async Task<IActionResult> SaveBike([FromBody] BikeModel bike)
        {
            Console.WriteLine($"Saving bike: Account Id = {bike.AccountId} Bike Type = {bike.BikeType} Frame={bike.Frame}, Shock={bike.Shock}, Fork={bike.Fork}, Wheels={bike.Wheels}, Tyres={bike.Tyres}, Drivetrain={bike.Drivetrain}, Seatpost={bike.Seatpost}, Saddle={bike.Saddle}, Bars={bike.Bars}, Stem={bike.Stem}, Pedals={bike.Pedals}");

            // Reject the request if no account ID was provided (user is not logged in)
            if (bike.AccountId == 0)
            {
                return BadRequest("Missing Account ID");
            }

            // Map the request data to a new SavedBike database record
            var NewBike = new SavedBike
            {
                AccountId = bike.AccountId,
                BikeType = bike.BikeType,
                Frame = bike.Frame,
                Shock = bike.Shock,
                Fork = bike.Fork,
                Wheels = bike.Wheels,
                Tyres = bike.Tyres,
                Drivetrain = bike.Drivetrain,
                Brakes = bike.Brakes,
                Seatpost = bike.Seatpost,
                Saddle = bike.Saddle,
                Bars = bike.Bars,
                Stem = bike.Stem,
                Pedals = bike.Pedals
            };

            _db.SavedBikes.Add(NewBike);
            await _db.SaveChangesAsync();

            // Return the new bike's generated database ID so the front end can reference it
            return Ok(new { message = "Bike saved.", bikeId = NewBike.Id });
        }

        // Request model used to deserialise the incoming bike data from the front end
        public class BikeModel
        {
            public int AccountId { get; set; }
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

        //-------------------------------DELETE BIKE-------------------------------

        // Request model containing the ID of the bike to be deleted
        public class DeleteBikeRequest
        {
            public int BikeID { get; set; }
        }

        // Deletes a saved bike record from the database by its ID
        [HttpPost("delete-bike")]
        public async Task<IActionResult> DeleteBike(DeleteBikeRequest request)
        {
            // Find the bike record by ID
            var bike = await _db.SavedBikes.FirstOrDefaultAsync(b => b.Id == request.BikeID);

            // Return 404 if no bike with that ID exists
            if (bike == null)
            {
                return NotFound("Bike not found");
            }

            _db.SavedBikes.Remove(bike);
            await _db.SaveChangesAsync();

            return Ok("Bike deleted");
        }
    }
}