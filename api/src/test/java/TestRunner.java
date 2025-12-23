import com.intuit.karate.junit5.Karate;

public class TestRunner {
    
    @Karate.Test
    Karate testAll() {
        String tags = System.getProperty("tags");
        if (tags != null && !tags.isEmpty()) {
            return Karate.run("classpath:features").tags(tags);
        }
        return Karate.run("classpath:features");
    }
}

