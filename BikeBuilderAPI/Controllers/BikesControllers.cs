using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace BikeBuilderAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BikesController : ControllerBase
    {
        [HttpPost]
        public IActionResult SaveBike([FromBody] BikeModel bike)
        {
            Console.WriteLine($"Saving bike: Bike Type = {bike.BikeType} Frame={bike.Frame}, Shock={bike.Shock}, Fork={bike.Fork}, Wheels={bike.Wheels}, Tyres={bike.Tyres}, Drivetrain={bike.Drivetrain}, Seatpost={bike.Seatpost}, Saddle={bike.Saddle}, Bars={bike.Bars}, Stem={bike.Stem}, Pedals={bike.Pedals}");
            return Ok();
        }

        public class BikeModel
        {
            public string BikeType { get; set; }
            public string Frame { get; set; }
            public string Shock { get; set; }
            public string Fork { get; set; }
            public string Wheels { get; set; }
            public string Tyres { get; set; }
            public string Drivetrain { get; set; }
            public string Seatpost { get; set; }
            public string Saddle { get; set; }
            public string Bars { get; set; }
            public string Stem { get; set; }
            public string Pedals { get; set; }
        }
    }
}
