/**
 * @description       : To determine the brand of the card based on the card number
 * @author            : Sagar Paresh Shah (sagar.23723@gmail.com)
 * @group             :
 * @last modified on  : 12-11-2021
 * @last modified by  : Sagar Paresh Shah (sagar.23723@gmail.com)
 **/
public without sharing class GetCardBrandDetails {
    /**
     * @description - set the card brand based on the given card number
     * @author Sagar Paresh Shah (sagar.23723@gmail.com) | 09-06-2021
     * @param ccNumber - card number
     * @return string
     **/
    @AuraEnabled
    public static string checkCardBrand(String ccNumber) {
      String result = 'Card';
  
      String amexRegex = '^3[47][0-9]{0,13}$';
      String visaRegex = '^4[0-9]{0,12}(?:[0-9]{3})?$';
      String masterCardRegex1 = '^5[1-5][0-9]{0,14}$';
      String masterCardRegex2 = '^2[2-7][0-9]{0,14}$';
  
      Pattern amexPattern = Pattern.compile(amexRegex);
      Pattern visaPattern = Pattern.compile(visaRegex);
      Pattern masterPattern1 = Pattern.compile(masterCardRegex1);
      Pattern masterPattern2 = Pattern.compile(masterCardRegex2);
  
      Matcher amexCardMatcher = amexPattern.matcher(ccNumber);
      Matcher visaCardMatcher = visaPattern.matcher(ccNumber);
      Matcher masterCardMatcher1 = masterPattern1.matcher(ccNumber);
      Matcher masterCardMatcher2 = masterPattern2.matcher(ccNumber);
  
      if (amexCardMatcher.matches()) {
        result = 'American Express';
      } else if (visaCardMatcher.matches()) {
        result = 'Visa Card';
      } else if (masterCardMatcher1.matches() || masterCardMatcher2.matches()) {
        result = 'Mastercard';
      }
      return result;
    }
  
    @AuraEnabled
    public static cardWrapper getCardMeta(String ccNumber) {
      cardWrapper cardMeta = new cardWrapper(null, null, null, null);
  
      cardMeta.cardBrand = checkCardBrand(ccNumber);
      if (cardMeta.cardBrand == 'American Express') {
        cardMeta.cardPartition = new List<Integer>{ 4, 6, 5 };
        cardMeta.cardLength = 15 + cardMeta.cardPartition.size() - 1;
        cardMeta.cvvLength = 4;
      } else if (
        cardMeta.cardBrand == 'Visa Card' ||
        cardMeta.cardBrand == 'Mastercard'
      ) {
        cardMeta.cardPartition = new List<Integer>{ 4, 4, 4, 4 };
        cardMeta.cardLength = 16 + cardMeta.cardPartition.size() - 1;
        cardMeta.cvvLength = 3;
      } else if (cardMeta.cardBrand == 'Card') {
        cardMeta.cardPartition = new List<Integer>{ 4, 4, 4, 4 };
        cardMeta.cardLength = 16 + cardMeta.cardPartition.size() - 1;
        cardMeta.cvvLength = 3;
      }
  
      return cardMeta;
    }
  
    public class cardWrapper {
      @AuraEnabled
      public String cardBrand;
      @AuraEnabled
      public List<Integer> cardPartition;
      @AuraEnabled
      public Integer cardLength;
      @AuraEnabled
      public Integer cvvLength;
  
      public cardWrapper(
        String cardBrand,
        List<Integer> cardPartition,
        Integer cardLength,
        Integer cvvLength
      ) {
        this.cardBrand = cardBrand;
        this.cardPartition = cardPartition;
        this.cardLength = cardLength;
        this.cvvLength = cvvLength;
      }
    }
  }