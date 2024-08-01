import { LoadingOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@apollo/react-hooks";
import React, { useContext, useEffect, useState } from "react";

import { AuthContext, FaceThresholdDistanceContext } from "../context";
import { createMatcher } from "../faceUtil";
import { attendanceMode, DEFAULT_ATTENDANCE_MODE } from "../globalData";

import { CheckError } from "../utils/ErrorHandling";
import ProcessFaceRecognition from "./ProcessFaceRecognition";

export default (props) => {
  const { user } = useContext(AuthContext);
  const { threshold, setFaceThresholdDistance } = useContext(
    FaceThresholdDistanceContext
  );
  const [mode, setMode] = useState(DEFAULT_ATTENDANCE_MODE);
  const [isOn, setIsOn] = useState(true);

  const [participants, setParticipants] = useState([]);
  const [facePhotos, setFacePhotos] = useState([]);
  const [faceMatcher, setFaceMatcher] = useState(null);

  const [absentees, setAbsentees] = useState([]);
  const [course, setCourse] = useState({});

  const { data, loading, error } = useQuery(
    FETCH_FACE_MATCHER_IN_COURSE_QUERY,
    {
      onError(err) {
        console.log(err);
        // props.history.push("/dashboard");
        CheckError(err);
      },
      variables: {
        courseID: props.match.params.courseID,
      },
    }
  );

  useEffect(() => {
    if (data) {
      setCourse(data.getFaceMatcherInCourse.course);
      setParticipants(data.getFaceMatcherInCourse.matcher);
      setAbsentees(data.getFaceMatcherInCourse.matcher);
      data.getFaceMatcherInCourse.matcher.map((item) => {
        item.facePhotos.map((photo) =>
          setFacePhotos((prevState) => [...prevState, photo])
        );
      });

      if (data.getFaceMatcherInCourse.matcher.length === 0) {
        alert("Course do not have any participant yet!");
      }
    }
  }, [data, participants]);
  const attendanceGQLQuery = useQuery(FETCH_ATTENDANCE_QUERY, {
    onError(err) {
      props.history.push(
        `/course/${props.match.params.courseID}/attendanceList`
      );
      CheckError(err);
    },
    pollInterval: 2000,

    variables: {
      attendanceID: props.match.params.attendanceID,
    },
  });

  useEffect(() => {
    if (attendanceGQLQuery.data) {
      setMode(attendanceGQLQuery.data.getAttendance.mode);
      alert("Attendance Mode: " + attendanceGQLQuery.data.getAttendance.mode);
      setIsOn(attendanceGQLQuery.data.getAttendance.isOn);
      if (attendanceGQLQuery.data.getAttendance.isOn)
        alert("Attendance is currently opened");
      else {
        if (user.userLevel == 0)
          alert("Attendance had been closed by the host.");
        else {
          alert("You closed the attendance, no transaction will be recorded");
        }
      }
    }
  }, [attendanceGQLQuery.data]);

  useEffect(() => {
    async function matcher() {
      //check there should be at least one matcher
      if (
        data.getFaceMatcherInCourse.matcher.length > 0 &&
        facePhotos.length > 0
      ) {
        const validMatcher = data.getFaceMatcherInCourse.matcher.filter(
          (m) => m.facePhotos.length > 0
        );
        const profileList = await createMatcher(validMatcher, threshold);
        setFaceMatcher(profileList);
      }
    }
    if (!!data) {
      matcher();
    }
  }, [data, facePhotos, threshold]);

  const [editAttendanceModeCallback, editAttendanceModeStatus] = useMutation(
    EDIT_ATTENDANCE_MODE_MUTATION,
    {
      onCompleted: async (data) => {
        setMode(data.editAttendanceMode.mode);
        alert(`Set Mode To ${data.editAttendanceMode.mode}`);
      },
      onError(err) {
        CheckError(err);
      },
    }
  );

  const [editAttendanceOnOffCallback, editAttendanceOnOffStatus] = useMutation(
    EDIT_ATTENDANCE_ON_OFF_MUTATION,
    {
      onCompleted: async (data) => {
        setIsOn(data.editAttendanceOnOff.isOn);
        alert(
          `Attendance is ${data.editAttendanceOnOff.isOn == 1 ? " on" : " off"}`
        );
      },
      onError(err) {
        CheckError(err);
      },
    }
  );

  const handleModeChange = (value) => {
    editAttendanceModeCallback({
      variables: {
        attendanceID: props.match.params.attendanceID,
        mode: value,
      },
    });
  };

  const handleIsOnChange = (value) => {
    editAttendanceOnOffCallback({
      variables: {
        attendanceID: props.match.params.attendanceID,
        isOn: value,
      },
    });
  };

  return (
    <>
      <div
        title={
          mode == "F2F" ? (
            <span level={4}>F2F Attendance</span>
          ) : (
            <span level={4}>Remote Attendance</span>
          )
        }
      >
        {data && (
          <span level={4}>
            Course:{" "}
            {course.code + "-" + course.name + "(" + course.session + ")"}
          </span>
        )}
      </div>

      {user.userLevel == 1 && (
        <div title={<Title level={4}>Attendance Setting</Title>}>
          {editAttendanceModeStatus.loading ? (
            <span></span>
          ) : (
            <select value={mode} onChange={handleModeChange}>
              {attendanceMode.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          )}

          {editAttendanceOnOffStatus.loading ? (
            <div>Loading Attendence</div>
          ) : (
            <div>dsfdfsgfd</div>
          )}
        </div>
      )}

      {/* For F2F, use Lecturer PC For FR */}
      {attendanceGQLQuery.data &&
        isOn &&
        mode == "F2F" &&
        user.userLevel == 1 && (
          <ProcessFaceRecognition
            {...props}
            faceMatcher={faceMatcher}
            facePhotos={facePhotos}
            participants={participants}
          />
        )}
      {/* For Remote, use Student PC For FR */}

      {attendanceGQLQuery.data &&
        isOn &&
        mode == "Remote" &&
        user.userLevel == 0 && (
          <ProcessFaceRecognition
            {...props}
            faceMatcher={faceMatcher}
            facePhotos={facePhotos}
            participants={participants}
          />
        )}
    </>
  );
};
