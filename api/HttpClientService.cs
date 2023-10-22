using System.Text.Json;

namespace api;

public class HttpClientService(HttpClient httpClient)
{
    public async Task<AddressRootObject> GetAddressSuggestion(string addressSearchTerm)
    {
        var addressLookupUrl = "https://api.geoapify.com/v1/geocode/autocomplete" +
                               "?text=" + addressSearchTerm + "" +
                               "&format=json&apiKey=" + Environment.GetEnvironmentVariable("GEOCODEAPIKEY");
        var response = await httpClient.GetAsync(addressLookupUrl);
        return JsonSerializer.Deserialize<AddressRootObject>(await response.Content.ReadAsStringAsync()) ??
               throw new InvalidOperationException();
    }

    public async Task<string> GetCurrencyCodeFromCountryCode(string countryCode)
    {
        //addressBody.results[0].country_code
        var countryLookupUrl = "https://restcountries.com/v3.1/alpha/" + countryCode;
        var countryResponse = await httpClient.GetAsync(countryLookupUrl);
        var body = await countryResponse.Content.ReadAsStringAsync();
        List<CountryRootObject> countryInfo = JsonSerializer.Deserialize<List<CountryRootObject>>(body) ?? throw new InvalidOperationException();
        return countryInfo.First().currencies.Keys.First();
    }

    public async Task<CurrencyRootObject> ConvertFromDkkToForeignCurrency(string currencyCode)
    {
        //  countryBody[0].currencies.Keys.First() 
        var currencyLookupUrl = "https://api.freecurrencyapi.com/v1/latest" +
                                "?base_currency=DKK" +
                                "&currencies=" + currencyCode +
                                "&apikey=" + Environment.GetEnvironmentVariable("CURRENCYCONVERTERAPIKEY");
        var currencyResponse = await httpClient.GetAsync(currencyLookupUrl);
        return JsonSerializer.Deserialize<CurrencyRootObject>(await currencyResponse.Content.ReadAsStringAsync()) ?? throw new InvalidOperationException();
    }
}