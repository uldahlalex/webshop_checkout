using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
public class CheckoutController(HttpClientService httpService, MailService mailService) : ControllerBase
{

    [RateLimit(20)]
    [HttpGet]
    [Route("/api/address")]
    public async Task<AddressRootObject> AddressAutoComplete([FromQuery] string addressSearchTerm)
    {
        return await httpService.GetAddressSuggestion(addressSearchTerm);
    }

    [HttpGet]
    [Route("/api/currency")]
    public async Task<CurrencyRootObject> CurrencyConversion([FromQuery] string fullAddress)
    {
        var address = await httpService.GetAddressSuggestion(fullAddress);
        var currencyCode = await httpService.GetCurrencyCodeFromCountryCode(address.results.First().country_code);
        return await httpService.ConvertFromDkkToForeignCurrency(currencyCode);
    }
    
    [HttpPost]
    [Route("/api/order")]
    public async Task<object> SubmitOrder(PostOrderDto dto)
    {
        //In a realistic setting, the client would send an identification number of the item ordered, and not just the price.
        //Then the server would be responsible for looking up the price, and not just trusting the client.
        //For simplicity's sake, we'll assume the price is not modified by the client
        //Most of what this method is doing is confirming the conversion is indeed correct, and then sending a confirmation email.
        var address = await httpService.GetAddressSuggestion(dto.ShippingAddress);
        var currencyCode = await httpService.GetCurrencyCodeFromCountryCode(address.results.First().country_code);
        var currencyConversion = await httpService.ConvertFromDkkToForeignCurrency(currencyCode);
        if (currencyConversion.data.Values.First() * dto.DkkPrice == dto.ConvertedPrice)
        {
            mailService.SendEmail(currencyConversion.data.Values.First()*dto.DkkPrice, currencyConversion.data.Keys.First());
            return new {message = "Order has been placed - an Email has been sent to you!"}; //This should then be shown to the client in the UI
        }
        throw new Exception("Local currency price calculation error");
    }
}