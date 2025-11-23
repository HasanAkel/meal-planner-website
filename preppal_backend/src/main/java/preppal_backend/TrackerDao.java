package preppal_backend;

import java.sql.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class TrackerDao {
    private static final String URL = "jdbc:mysql://localhost:3306/preppal?useSSL=false&serverTimezone=UTC";
    private static final String USER = "root";
    private static final String PASSWORD = "";    //put real password here

    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }

    private Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }

// Get nutrition statistics for a time period
 public Map<String, Object> getNutritionStats(int userId, String period) throws SQLException {
     Map<String, Object> stats = new HashMap<>();
     
     // Initialize defaults
     stats.put("calories", 0);
     stats.put("protein", 0);
     stats.put("carbs", 0);
     stats.put("fat", 0);

     LocalDate endDate = LocalDate.now();
     LocalDate startDate = endDate;
     boolean isAverageNeeded = false; 

     // Determine Date Range
     if ("today".equalsIgnoreCase(period)) {
         startDate = endDate;
     } else if ("this week".equalsIgnoreCase(period)) {
         startDate = endDate.minusDays(6); // Last 7 days
         isAverageNeeded = true; // Show daily average for the week
     } else if ("this month".equalsIgnoreCase(period)) {
         startDate = endDate.withDayOfMonth(1);
         isAverageNeeded = true; // Show daily average for the month
     }

     // Query for Totals
     String sumSql = "SELECT SUM(r.calories) as total_cals, " +
                     "       SUM(r.protein) as total_protein, " +
                     "       SUM(r.carbs) as total_carbs, " +
                     "       SUM(r.fat) as total_fat " +
                     "FROM consumed_meals cm " +
                     "JOIN recipes r ON cm.recipe_id = r.id " +
                     "WHERE cm.user_id = ? AND cm.consumed_date BETWEEN ? AND ?";

     int totalCals = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;

     try (Connection conn = getConnection(); 
          PreparedStatement ps = conn.prepareStatement(sumSql)) {
         ps.setInt(1, userId);
         ps.setDate(2, Date.valueOf(startDate));
         ps.setDate(3, Date.valueOf(endDate));

         try (ResultSet rs = ps.executeQuery()) {
             if (rs.next()) {
                 totalCals = rs.getInt("total_cals");
                 totalProtein = rs.getInt("total_protein");
                 totalCarbs = rs.getInt("total_carbs");
                 totalFat = rs.getInt("total_fat");
             }
         }
     }

     // Calculate Averages if needed
     if (isAverageNeeded) {
         String countSql = "SELECT COUNT(DISTINCT consumed_date) as days_tracked " +
                           "FROM consumed_meals " +
                           "WHERE user_id = ? AND consumed_date BETWEEN ? AND ?";
         int daysTracked = 0;
         try (Connection conn = getConnection(); 
              PreparedStatement ps = conn.prepareStatement(countSql)) {
             ps.setInt(1, userId);
             ps.setDate(2, Date.valueOf(startDate));
             ps.setDate(3, Date.valueOf(endDate));
             try (ResultSet rs = ps.executeQuery()) {
                 if (rs.next()) daysTracked = rs.getInt("days_tracked");
             }
         }
         
         if (daysTracked > 0) {
             stats.put("calories", totalCals / daysTracked);
             stats.put("protein", totalProtein / daysTracked);
             stats.put("carbs", totalCarbs / daysTracked);
             stats.put("fat", totalFat / daysTracked);
         }
     } else {
         stats.put("calories", totalCals);
         stats.put("protein", totalProtein);
         stats.put("carbs", totalCarbs);
         stats.put("fat", totalFat);
     }
     
     return stats;
 }

 //get data for the whole week to put into chart
 public List<Map<String, Object>> getWeeklyCalorieData(int userId) throws SQLException {
     List<Map<String, Object>> weeklyData = new ArrayList<>();
     
     String sql = "SELECT cm.consumed_date, SUM(r.calories) as day_calories " +
                 "FROM consumed_meals cm " +
                 "JOIN recipes r ON cm.recipe_id = r.id " +
                 "WHERE cm.user_id = ? AND cm.consumed_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) " +
                 "GROUP BY cm.consumed_date " +
                 "ORDER BY cm.consumed_date";
     
     try (Connection conn = getConnection();
          PreparedStatement ps = conn.prepareStatement(sql)) {

         ps.setInt(1, userId);
         try (ResultSet rs = ps.executeQuery()) {
             Map<LocalDate, Integer> dateCalories = new HashMap<>();
             while (rs.next()) {
                 LocalDate date = rs.getDate("consumed_date").toLocalDate();
                 dateCalories.put(date, rs.getInt("day_calories"));
             }
             
             for (int i = 6; i >= 0; i--) {
                 LocalDate date = LocalDate.now().minusDays(i);
                 Map<String, Object> dayData = new HashMap<>();
                 dayData.put("date", date.toString());
                 dayData.put("calories", dateCalories.getOrDefault(date, 0));
                 // This "dayName" (e.g., MON, TUE) will be our chart label
                 dayData.put("dayName", date.getDayOfWeek().toString().substring(0, 3)); 
                 weeklyData.add(dayData);
             }
         }
     }
     return weeklyData;
 }

    // Mark a planned meal as consumed
    public boolean markMealAsConsumed(int userId, int recipeId) throws SQLException {
        String sql = "INSERT INTO consumed_meals (user_id, recipe_id, consumed_date, consumed_time) VALUES (?, ?, CURDATE(), CURTIME())";

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);
            ps.setInt(2, recipeId);
            return ps.executeUpdate() > 0;
        }
    }

    //find the recent meals for the user
    public List<Map<String, Object>> getRecentMeals(int userId) throws SQLException {
        List<Map<String, Object>> meals = new ArrayList<>();
        String sql = "SELECT r.name, r.calories, r.image_path, cm.consumed_date " +
                    "FROM consumed_meals cm " +
                    "JOIN recipes r ON cm.recipe_id = r.id " +
                    "WHERE cm.user_id = ? " +
                    "ORDER BY cm.consumed_date DESC, cm.consumed_time DESC " +
                    "LIMIT 5";

        try (Connection conn = getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> meal = new HashMap<>();
                    meal.put("name", rs.getString("name"));
                    meal.put("calories", rs.getInt("calories"));
                    meal.put("imagePath", rs.getString("image_path"));
                    meal.put("consumedDate", rs.getDate("consumed_date").toString());
                    meals.add(meal);
                    
                    System.out.println("Recent meal: " + meal);
                }
            }
        }
        
        System.out.println("Total recent meals found: " + meals.size());
        return meals;
    }
}
