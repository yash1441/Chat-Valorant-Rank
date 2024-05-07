# Chat-Valorant-Rank
This API lets you fetch your rank dynamically, typically for making **!rank** command in your Twitch/YouTube stream.

#### URL HAS CHANGED, PLEASE UPDATE WITH THE NEW URL BELOW

## StreamElements/NightBot Usage
1. Copy the following code and paste it in the output of whatever custom command you want to create.<br>
`$(customapi.https://splendid-groovy-feverfew.glitch.me/valorant/region/name/tag)`

2. Replace `region` with your account's region code, `name` with your Valorant username and `tag` with your hashtag.

<details>
 <summary><i>If you don't want your name and tag in the response then open this</i></summary>
 
  3. If you don't want your name and tag to be shown then add `?onlyRank=true` at the end of the URL. So the updated URL would look something like this: `$(customapi.https://splendid-groovy-feverfew.glitch.me/valorant/region/name/tag?onlyRank=true)`
</details>

### Region Codes

| Region Code | Corresponding Region |
| ----------- | -------------------- |
| ap          | Asia/Pacific         |
| br          | Brazil               |
| eu          | Europe               |
| kr          | Korea                |
| latam       | Latin America        |
| na          | North America        |


## Examples

Here is an example for my account. This would work for most accounts.
+ Example #1
  * Username: `Simon#Tan`
  * Account Region: `Asia/Pacific`
  * URL: `$(customapi.https://splendid-groovy-feverfew.glitch.me/valorant/ap/Simon/Tan)`

Here is an example for an account with space(s) in middle. You don't need to put space in the URL so you can ignore spaces in your name.
+ Example #2
  * Username: `SEN TenZ#0505`
  * Account Region: `North America`
  * URL: `$(customapi.https://splendid-groovy-feverfew.glitch.me/valorant/na/SENTenZ/0505)`
  
Here is an example for my account but without my name and tag in the command response.
+ Example #3
  * Username: `Simon#Tan`
  * Account Region: `Asia/Pacific`
  * URL: `$(customapi.https://splendid-groovy-feverfew.glitch.me/valorant/ap/Simon/Tan?onlyRank=true)`


## Troubleshooting

### Why is it not working?
Please double check the URL you are using. If everything works fine on your end then check if the status of the backend API [here](https://status.henrikdev.xyz/). If that is also up then create an issue with details about the URL you used and what exactly you are facing.
