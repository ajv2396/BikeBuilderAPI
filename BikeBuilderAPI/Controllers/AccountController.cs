using BikeBuilderAPI.Model;
using BikeBuilderAPI.Models;
using BikeBuilderAPI.Utils;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BikeBuilderAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        [HttpPost("/api/logout/clear-session")]
        public IActionResult ClearSession()
        {
            ClearUserSession.Clear();
            return Ok();
        }

        [HttpPost("/api/logout/clear-saves")]
        public IActionResult ClearSaves()
        {
            ClearUserSaves.Clear();
            return Ok();
        }

        [HttpPost("/api/logout/refresh-user-saves")]
        public IActionResult RefreshUserSaves()
        {
            var SessionFile = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "user_session.json");

            var json = System.IO.File.ReadAllText(SessionFile);
            var session = System.Text.Json.JsonSerializer.Deserialize<SessionUser>(json);

            using (var db = new AccountsContext())
            {
                UserSaveExporter.ExportUserSavesToJson(session.AccountId, db);
            }
            return Ok();
        }
    }
}
