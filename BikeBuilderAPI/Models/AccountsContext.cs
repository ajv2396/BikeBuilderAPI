using BikeBuilderAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace BikeBuilderAPI.Model
{
    public class AccountsContext : DbContext
    {
        public DbSet<Account> Accounts {  get; set; }
        public DbSet<SavedBike> SavedBikes { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder options)
            => options.UseSqlite(@"Data Source = MTB-Builder.db");

    }
}
