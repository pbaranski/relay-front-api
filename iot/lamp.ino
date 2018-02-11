#include <ESP8266WiFi.h>
#include <aREST.h>
#include <aREST_UI.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

// aREST instance
aREST_UI rest = aREST_UI();

// NETWORK: Static IP details...
IPAddress ip(192, 168, 1, 126);
IPAddress gateway(192, 168, 1, 1);
IPAddress subnet(255, 255, 255, 0);

// WiFi parameters
const char* ssid = "wifi name";  // edit this
const char* password = "wifi password"; // edit this

const char* host = "your.node.site.com"; //edit this
const int  port = 80;

int ledState = false;
byte relON[] = {0xA0, 0x01, 0x00, 0xA1};  //Hex command to send to serial for open relay
byte relOFF[] = {0xA0, 0x01, 0x01, 0xA2}; //Hex command to send to serial for close relay
// port conncetions TCP
#define LISTEN_PORT           80

// aREST instance server
WiFiServer server(LISTEN_PORT);

int ledControl(String command);
StaticJsonBuffer<200> jsonBuffer;

void setup(void)
{
  Serial.begin(9600);

  // aREST UI
  //rest.title("Relay ");
  //rest.button(0);
  //rest.button(1);

  // aREST Function to be exposed
  rest.function("led",ledControl);

  // aREST ID module
  //rest.set_id("1");
  //rest.set_name("esp8266");

  //rest.set_id("0");

  // connecte wifi
  // WiFi.config(ip, gateway, subnet); // only when you need static ip
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.write(relOFF, sizeof(relOFF));
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println(WiFi.macAddress());
  // initialise le serveur
  server.begin();
  Serial.println("Server started");

  // imprimme l'adresse IP
  Serial.println(WiFi.localIP());

}

void loop() {
  Serial.println(WiFi.localIP());
  Serial.println("Entering loop");

  Serial.println("Init WIFI client");
  WiFiClient client = server.available();
  Serial.println("Client");
  Serial.println(client);
  if (!client) {
    Serial.println("Client unsuccesfull");
    // return;
  }

  // Serial.println("Checking if client available");
  // while(!client.available()){
    // delay(1);
  // }
  Serial.println("Rest handle client");
  rest.handle(client);
  Serial.println("HttpClient");
  HTTPClient http;
  Serial.println("Request for lamp status");

  http.begin(host, port, "/api/lampOld" );  //Specify request destination
  Serial.println("Getting http.get");
  int httpCode = http.GET();
  Serial.println(httpCode);
  String response = http.getString();
  //String response = "{\"state\":1}";
  Serial.println("Response: ");
  Serial.println(response);

   int state_api = response.toInt();
   Serial.println("State");
   Serial.println(state_api);
   if (state_api == 1 && ledState == false) {
      //Check the returning code
      Serial.println("State 1");
      Serial.write(relON, sizeof(relON));
      ledState = true;// turns the relay ON
   }
   if (state_api == 0 && ledState == true)
   {
      Serial.println("State 0 else");
      Serial.write(relOFF, sizeof(relOFF));
      ledState = false; // turns the relay OFF
   }
   Serial.println("http end");
   http.end();
   Serial.println("Statarting 2s delay");
   delay(2000);    //Send a request every 30 seconds
   Serial.println("delay end - checking rest for local ip");

    if (ledState == true) {
      Serial.println("Led state true rest request");
     // Serial.write(relON, sizeof(relON));     // turns the relay ON
    } else {
      Serial.println("Led state fales rest request");
     // Serial.write(relOFF, sizeof(relOFF));   // turns the relay OFF
    }

}

// Custom function accessible by the API
int ledControl(String command) {
  int state = command.toInt();
  if (state == 1) {
      ledState = true;
      return 1;
  } else {
      ledState = false;
     return 0;
  }
}