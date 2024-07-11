import React, { useEffect, useState, useRef } from "react";
import { getResult } from "../services/PhotoResults";
import WebMWriter from "../videoBuilder/newClasses/WebMWriter";
import { colorWay } from "../reusables/colorWay";
import { asset } from "../reusables/useAsset";
import Input from "../components/Input";
import TextInput from "../components/TextInput";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { craeteReview } from "../services/Review";
import { font, fontString } from "../reusables/font";
import DatePicker from "../components/DatePicker";
import Selection from "../components/Select";
import moment from "moment";
import { responsive } from "../reusables/responsive";
// import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import DownloadButton from "../components/DownloadButton";
import Rating from "../components/Rating";
import { createUser } from "../services/Register";





export default function Register() {
    const windowWidth = useRef(window.innerWidth);
    const windowHeight = useRef(window.innerHeight);

    function makeResponsive(big, small) {
        return responsive(windowWidth.current, big, small);
    }
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [gender, setGender] = useState("");
    const [clicked, setClicked] = useState(false);
    const [message, setMessage] = useState("");
    

    const [genderOptions, setGenderOptions] = useState([
        { value: "Laki-laki", label: "Laki-laki" },
        { value: "Perempuan", label: "Perempuan" },
    ]);
    const [masterOptionSource, setMasterOptionSource] = useState([
        {
            id: 1,
            label: "Instagram",
        },
        { id: 2, label: "Tiktok" },
        {
            id: 3,
            label: "Teman",
        },
        {
            id: 4,
            label: "Venue",
        },
    ]);
    const [selectedSource, setSelectedSource] = useState({});
    const [date, setDate] = useState("");

    function validatePhone(phone) {
        var re = RegExp("^((08|622|628)[0-9]{9,14})$");
        return re.test(phone);
      }
      function validateEmail(email) {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
      }
      async function submitReview() {
        setClicked(true);
        const search = window.location.search;
        const params = new URLSearchParams(search);
        const uuid = params.get("id");
    
        let data = {
          id: uuid,
          name,
          phone,
          email,
          dateOfBirth: moment(date).format("YYYY-MM-DD"),
          gender: gender?.value ?? "",
          source: selectedSource.label,
        };
    
        const response = await createUser(data);
    
        if (parseInt(response.success) === 1) {
          const options = { year: "numeric", month: "long", day: "numeric" };
        } else if (parseInt(response.success) === 4) {
        }
      }
    return (
        <>
            <div
                style={{
                    backgroundColor: colorWay.hijauBg,
                    minHeight: "100vh",
                    minWidth: "100vw",
                }}
            >
                <Navbar clientWidth={windowWidth.current} clientHeight={windowHeight.current} />
                <div
                    style={{
                        backgorundColor: colorWay.putih,
                        width: "100%",
                        display: "flex",
                        flexWrap: "wrap",
                        alignSelf: "flex-start",
                        justifyContent: "center",
                        marginTop: "10vh",
                        marginBottom: "15vh",
                    }}
                >
                    <img
                        src={responsive(windowWidth.current, asset("memoriesInYourPocket"), asset("register"))}
                        style={{ width: responsive(windowWidth.current, "65vw", "80vw") }}
                    />
                    <form>
                        <div>
                            <Input name={"Nama"} setter={setName} setted={name} clientWidth={windowWidth.current} />
                            <Input name={"No HP"} setter={setPhone} setted={phone} type={"tel"} clientWidth={windowWidth.current} />
                            <Input
                                name={"Email"}
                                setter={setEmail}
                                setted={email}
                                type={"email"}
                                clientWidth={windowWidth.current}
                            />
                            <DatePicker name={"Tanggal Lahir"}setter={setDate} setted={date} clientWidth={windowWidth.current} />
                        </div>
                        <div>
                            <Selection
                                name={"Gender"}
                                setter={setGender}
                                setted={gender}
                                options={genderOptions}
                                clientWidth={windowWidth.current}
                            />
                            <Selection
                                name={"Pernah denger Sukhakala dari mana"}
                                setter={setSelectedSource}
                                setted={selectedSource}
                                options={masterOptionSource}
                                clientWidth={windowWidth.current}
                            />
                        </div>
                        <button
                  style={{
                    height: makeResponsive("7vh", "4vh"),
                    width: "auto",
                    marginTop: makeResponsive("2vh", "1vh"),
                    backgroundColor: "transparent",
                    outline: "none",
                    border: "none",
                  }}

                  onClick={(e) => {
                    submitReview();
                  }}
                >
                  <img style={{ height: "inherit", width: "inherit" }} src={asset("back")} />
                </button>
                        <button
                  style={{
                    height: makeResponsive("7vh", "4vh"),
                    width: "auto",
                    marginTop: makeResponsive("2vh", "1vh"),
                    backgroundColor: "transparent",
                    outline: "none",
                    border: "none",
                  }}
                  disabled={
                    clicked ||
                    message !== "" ||
                    selectedSource.value === "" ||
                    name === "" ||
                    validatePhone(phone) === false ||
                    validateEmail(email) === false ||
                    date === "" ||
                    gender === "" 
                    
                  }
                  onClick={(e) => {
                    submitReview();
                  }}
                >
                  <img style={{ height: "inherit", width: "inherit" }} src={asset("next")} />
                </button>
                    </form>
                </div>
                <Footer clientWidth={windowWidth.current} clientHeight={windowHeight.current} />

            </div>

        </>
    )
}