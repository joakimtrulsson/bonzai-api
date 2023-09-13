# Bonz.ai Api

Projektet är ett bokningssystem utvecklat för Bonz.ai, ett fiktivt hotell. Systemet är byggt med AWS-teknologier. Vi har utnyttjat Serverless Framework för att enkelt hantera våra AWS-resurser. Amazon API Gateway används för hantera bokningsförfrågningar. Backend-logiken körs med hjälp av AWS Lambda-funktioner, och bokningsdata lagras och hanteras i DynamoDB.

## Användning

För att testa projektet och skapa rum i hotellets databas, följ dessa steg:

1. Gör en POST-förfrågan till `api/createrooms` med en tom body. Detta kommer att skapa rummen i `roomsDb` i DynamoDB och göra dem tillgängliga för bokning.

   Exempel med cURL:

   ```bash
   curl -X POST https://din-api-url/api/createrooms
   ```

### Deployment

För att publicera projektet måste du köra följande kommando:

```
$ serverless deploy
```

## Användning med Insomnia

För att enkelt testa och använda vårt bokningssystem i Insomnia, kan du importera vår färdigkonfigurerade Insomnia-fil.

1. Öppna Insomnia och välj "Import/Export" från huvudmenyn.

2. Klicka på "Import Data" och välj "From File" för att importera en fil.

3. Ladda ner vår [Insomnia JSON-fil] som innehåller alla förkonfigurerade bokningsförfrågningar och endpoints.

4. Öppna den importerade Insomnia-miljön och börja använda den för att utföra bokningsförfrågningar mot ditt Bonz.ai bokningssystem.

Nu kan du enkelt testa och använda API:et med Insomnia!

## Projektmedlemmar

Detta projekt skapades och utvecklades av följande personer:

- **Audrey**
- **Jocke**
- **Pablo**
- **William**
