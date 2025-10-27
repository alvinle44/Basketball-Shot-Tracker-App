import React, { useState } from "react";
//react is the library that lest UI building components 
//useState is react hook that lets you remember data 
//thesebelow are like html tags for mobile apps 
import {View, Text, Button, StyleSheet, Alert, Linking} from "react-native";

//doc picker allows for user to pick file from gallery
import * as DocumentPicker from "expo-document-picker";

//allows for video to be displayed in the app may go with allow user to download video route
import { Video, ResizeMode } from 'expo-av';


//define home screen and result variable to store backend data
export default function HomeScreen(){
  const [result, setResult] = useState<{ FGM?: number; FGA?: number; FG_percent?: number; download_url?: string;} | null>(null);
  const [uploading, setUploading] = useState(false)
  const handleTestApi = async() => {
    try {
      const response = await fetch("http://192.168.1.218:8000/live")
      const data = await response.json();
      setResult(data);
    } catch (error){
      console.error("Error connecting to backend: ", error)
    }
  };

  const handleUpload = async() => {
    //allow for user to select video to be uploaded 
    try {
      const vidSelected = await DocumentPicker.getDocumentAsync({
        type: "video/*",
      });
    //if the user does not select a video, return 
    if (vidSelected.canceled) return;
    //get the video path which is the uri on the deivce 
    const videoUri = vidSelected.assets[0].uri;
    //get the videoname 
    const filename = vidSelected.assets[0].name;

    const formData = new FormData();
    formData.append("file", {
      uri: videoUri,
      name: filename,
      type: "video/mp4",
    } as any);
    setUploading(true);
    /*
    form data is a web object that build data requests in a special format
    allows browers and servers to upload files 
    uri is where the file is stored on dev 
    filename string
    type is format of the item whcih is a video 
    In english this means: I am attaching a video named file and it contains mp4 video
    "file" the first parameter is the field name/label for the data on the backend side that accepts a file so backend knows what this 
    data is and matches it to the corr parameter of file to be accepted 

      /*
      so for reach app to send to backend fast api it needs two parts 
      header has the metadata regarding the request and information about your message
      ex. tells what is contained such as a video, address etc. 
      body is the actual data you want to send an in this case it is a video file 
      ex. the actual video data 
      Fetch: males a call do the server at upload in this instance 
      method: telling the backend what you want to do and in this case it is post which is create or upload 
      other methods are get to retrieve data ie the shot log history 
      delete is remove data
      put is update existing data 
      Body: formData
      this is the acutal data being sent and is formatted in formdata which holds files, text to be submited for upload
      */
    //await fetch sends http request to the backend to /upload to fastapi route that processes the upload 
    //draw = true to draw box on vid, implement ability to draw or not later 
    /*
    content-type tells the server what kind of data it is receiving in the body request 
    applications/json this body is json text and sening over plain data or objects 
    text/plain is for the body is jsut raw text for simple text
    multipart/form-data is body has multiple parts including text and files and is used for file uploads 
    */
    const vidResponse = await fetch("http://192.168.1.218:8000/upload?draw=true", {
      method: "POST", //post is the method where we send data to the server 
      body: formData, //formdata is the file being uploaded stored in teh formdata format from above
      // Authorization: login token/passoword if needed
      // Accept: "applications/json" this is for if i need a json bacl 
      headers: {
        "Content-Type": "multipart/form-data", //headers hold extra info for the server 
      },
    });

    const statsReponse = await vidResponse.json();
    setResult(statsReponse);
    setUploading(false);
    Alert.alert(
      "Video Processing Done",
      `FGM: ${statsReponse.FGM}\nFGA: ${statsReponse.FGA}\nFG%: ${statsReponse.FG_percent}`
    );


  }catch (error) {
    console.error("Upload error:", error);
    Alert.alert("Error", "Failed tp upload video")
  }

  };
  /*
  for reach needs to return the ui component which is like html
  render screen with the structure and style specified 
  View style is == div and is container that hodl other elements such as text or buttons
  style={styles.container} = applying style form stylesheet 
  Text style is just add text onto the screen styles.title applies the formatting of the text for you 

  */
  return (
    <View style={styles.container}>
      <Text style={styles.title}> Shot Tracker App</Text>
      <Button title="Test Backend Connect/Results" onPress={handleTestApi}/>
      {result && (
        <Text style={styles.result}>
          Successful Conection To Server
        </Text>
      )}
      <View style={{ marginTop: 20}}>
        <Button title={uploading? "Processing..." : "Upload Video for Tracking Results"} onPress={handleUpload} disabled={uploading}/>
      </View>
      {result && typeof result == "object" &&(
        <View style={styles.resultBox}>
          <Text style={styles.result}>FGM/FGA: {result.FGM}/{result.FGA}</Text>
          <Text style={styles.result}>FG%: {result.FG_percent}%</Text>
          {result.download_url && (
            <View style={{marginTop: 20, alignItems: "center", justifyContent: "center", width: "100%"}}>
              <Video
                source={{uri:result.download_url}}
                rate={1.0}
                volume={1.0}
                isMuted={false}
                shouldPlay={true}
                isLooping={true}
                resizeMode={ResizeMode.CONTAIN}
                useNativeControls
                style={{ width: 200, height:200, borderRadius:10 }}
              />

              <View style= {{marginTop:10 }}>
                <Button
                  title="Download Processed Video"
                  onPress={() => Linking.openURL(result.download_url!)}
                />
              </View>
              </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1, //fill screen vertical 
    justifyContent: "center", //center child vertically 
    alignItems: "center", //center horizontal 
    backgroundColor: "#121212"
  },
  title: {
    fontSize:30,
    fontWeight:"600",
    marginBottom:20,
    color: "white",
  },
  result: {
    marginTop:15,
    fontSize:18,
    color: "white",
  },
  resultBox: {
    marginTop: 30,
    backgroundColor: '#121212',
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  }

});