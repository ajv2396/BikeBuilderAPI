using BikeBuilderAPI.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Text.Json;
using System.Security.Cryptography;
using System.Text;

namespace BikeBuilderAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        //--------------------------------LOGIN--------------------------------
        public class LoginRequest
        {
            public string Email { get; set; }
            public string Password { get; set; }
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            using (var db = new AccountsContext())
            {
                var account = db.Accounts.FirstOrDefault(a =>  a.Email == request.Email);

                //if the email isnt found on database
                if (account == null)
                {
                    return Unauthorized(new { sucess = false, message = "Invalid credentials" });
                }

                string LoginHashedPassword = HashPassword(request.Password);
                //if the email is found then check if the password mathces it
                if (LoginHashedPassword == account.Password)
                {
                    SaveUserSession(account);
                    UserSaveExporter.ExportUserSavesToJson(account.AccountId, db);
                    UserOrderExporter.ExportOrdersToJson(account.AccountId, db);
                    return Ok(new { sucess = true, message = "Login sucessful" });
                }
                else
                {
                    return Unauthorized(new { success = false, message = "Invalid credentials" });
                }
            }
        }

        //-------------------------------SIGN UP-------------------------------
        public class SignUpRequest
        {
            public string FirstName { get; set; }
            public string LastName { get; set; }
            public string Email { get; set; }
            public string Password { get; set; }
        }

        [HttpPost("signup")]
        public IActionResult SignUp([FromBody] SignUpRequest request)
        {
            using (var db = new AccountsContext())
            {
                //for checking if email already exists in the database
                var EmailCheck = db.Accounts.FirstOrDefault(a => a.Email == request.Email);



                if (EmailCheck != null)
                {
                    return Conflict(new { success = false, message = "Email already registered" }); // "res.status === 409" in login.html handles this to stop users creating multiple accounts
                }

                string HashedPassword = HashPassword(request.Password);


                var account = new Account
                {
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Email = request.Email,
                    Password = HashedPassword
                };

                db.Add(account);
                db.SaveChanges();
                SaveUserSession(account);
            }
            return Ok("User signed up");
        }

        //-------------------------------SAVE USER SESSION-------------------------------
        public void SaveUserSession(Account account)
        {
            var sessionUser = new SessionUser
            {
                AccountId = account.AccountId,
                FirstName = account.FirstName,
                LastName = account.LastName,
                Email = account.Email
            };

            string json = JsonSerializer.Serialize(sessionUser);
            string FilePath = "wwwroot/user_session.json";

            using (FileStream FileStream = new FileStream(FilePath, FileMode.Create))
            using (StreamWriter StreamWriter = new StreamWriter(FileStream))
            {
                StreamWriter.Write(json);
            }
        }

        //-------------------------------SHA256 ENCRYPTION-------------------------------
        public static string HashPassword(string password)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] bytes = Encoding.UTF8.GetBytes(password);
                byte[] hashBytes = sha256.ComputeHash(bytes);
                StringBuilder builder = new StringBuilder();
                foreach (byte b in hashBytes)
                {
                    builder.Append(b.ToString("x2"));
                }

                return builder.ToString();
            }
        }
    }
}
