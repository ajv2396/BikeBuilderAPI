using BikeBuilderAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace BikeBuilderAPI.Model
{
    public class AccountsContext : DbContext
    {
        public DbSet<Account> Accounts {  get; set; }
        public DbSet<SavedBike> SavedBikes { get; set; }
        public DbSet<BikeParts> BikeParts { get; set; }
        public DbSet<Review> Reviews { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder options)
            => options.UseSqlite(@"Data Source = MTB-Builder.db");

        //configure primary key for reviews as not working previously
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Review>()
                .HasKey(r => r.ReviewId);

            base.OnModelCreating(modelBuilder);
        }

    }
}
