using BikeBuilderAPI.Model;
using System.Text.Json;

public class SessionUser
{
    public int AccountId { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
}