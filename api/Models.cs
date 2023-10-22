namespace api;

public class AddressRootObject
{
    public List<Result> results { get; set; }
}

public class Result
{
    public string? country_code { get; set; }
    public string? formatted { get; set; }
}




public class CountryRootObject
{
    public Dictionary<string, object> currencies { get; set; } //api responds with array of these
}


public class CurrencyRootObject
{
    public Dictionary<string, double> data { get; set; }
}

public class PostOrderDto
{
    public double DkkPrice { get; set; }
    public double ConvertedPrice { get; set; }
    public string? ShippingAddress { get; set; }
}

