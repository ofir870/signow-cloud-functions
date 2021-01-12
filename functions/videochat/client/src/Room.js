import React, { useState, useEffect } from 'react';
import Video from 'twilio-video';
import Participant from './Participant';

const openMic ="פתח מיקרופון";
const closeMic ="סגור מיקרופון";
const opeCam ="פתח מצלמה";
const closeCam ="סגור מצלמה";

const Room = ({ roomName, token, handleLogout }) => {
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [micState, setMicState] = useState(closeMic);
  const [camState, setCamState] = useState(closeCam);

  const toggleMic = () => {
    room.localParticipant.audioTracks.forEach(function(trackId, track) {
      if(micState == closeMic){
        track.disable();
      }
      else{
         track.enable();
      }
    });
    if(micState == closeMic){
      setMicState(openMic);
    }
    else{
      setMicState(closeMic);
    }
  }

  const toggleCam = () => {
    room.localParticipant.viseoTracks.forEach(function(trackId, track) {
      if(camState == closeCam){
        track.disable();
      }
      else{
         track.enable();
      }
    });
    if(camState == closeCam){
      setCamState(opeCam);
    }
    else{
      setCamState(closeCam);
    }
  }

  useEffect(() => {
    const participantConnected = participant => {
      setParticipants(prevParticipants => [...prevParticipants, participant]);
    };

    const participantDisconnected = participant => {
      setParticipants(prevParticipants =>
        prevParticipants.filter(p => p !== participant)
      );
    };

    Video.connect(token, {
      name: roomName
    }).then(room => {
      setRoom(room);
      room.on('participantConnected', participantConnected);
      room.on('participantDisconnected', participantDisconnected);
      room.participants.forEach(participantConnected);
    });

    return () => {
      setRoom(currentRoom => {
        if (currentRoom && currentRoom.localParticipant.state === 'connected') {
          currentRoom.localParticipant.tracks.forEach(function(trackPublication) {
            trackPublication.track.stop();
          });
          currentRoom.disconnect();
          return null;
        } else {
          return currentRoom;
        }
      });
    };
  }, [roomName, token]);

  const remoteParticipants = participants.map(participant => (
    <Participant key={participant.sid} participant={participant} />
  ));

  return (
    <div className="room">
      
      <div>
      <div className="remote-participants">{remoteParticipants}</div>
      <div className="local-participant">
        {room ? (
          <Participant
            key={room.localParticipant.sid}
            participant={room.localParticipant}
          />
        ) : (
          ''
        )}
      </div>
      </div>
      <div><h2>Meeting Id: {roomName}</h2>
      {/* <button onClick={handleLogout}>Log out</button> */}
      <span><button onClick={toggleMic}>{micState}</button></span><br/>
      <span><button onClick={toggleCam}>{camState}</button></span>
      </div>
    </div>
    
  );
};

export default Room;
