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

export default function PhotoResult() {
  const windowWidth = useRef(window.innerWidth);
  const windowHeight = useRef(window.innerHeight);

  function makeResponsive(big, small) {
    return responsive(windowWidth.current, big, small);
  }

  const [photoResults, setPhotoResults] = useState([]);
  // const [GIF, setGIF] = useState("")
  const [valid, setValid] = useState(false);
  const [renderCounter, setRenderCounter] = useState(0);
  const [videoData, setVideoData] = useState([]);
  const [isReviewed, setIsReviewed] = useState(false);

  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [desc, setDesc] = useState("");

  const [voucher, setVoucher] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [finishReview, setFinishReview] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [isReviewDiscount, setIsReviewDiscount] = useState(false);
  const [message, setMessage] = useState("");

  const canvasRef = useRef(null);
  // const ffmpegRef = useRef(new FFmpeg());
  const ffmpegRef = useRef(null);
  const videoRef = useRef(null);
  const messageRef = useRef(null);

  const [genderOptions, setGenderOptions] = useState([
    { value: "Laki-laki", label: "Laki-laki" },
    { value: "Perempuan", label: "Perempuan" },
  ]);

  const [selectedMerchant, setSelectedMerchant] = useState({});
  const [selectedSource, setSelectedSource] = useState({});

  const [masterOptionMerchant, setMasterOptionMerchant] = useState([]);
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
  const [rating, setRating] = useState(0);

  function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  function validatePhone(phone) {
    var re = RegExp("^((08|622|628)[0-9]{9,14})$");
    return re.test(phone);
  }

  const [date, setDate] = useState("");

  useEffect(() => {
    if (rating === 0) {
      setMessage("Isi Rating Bintang 1 sampai 5");
    } else if (name === "") {
      setMessage("Nama Tidak Boleh Kosong");
    } else if (phone === "") {
      setMessage("Nomor Telepon Tidak Boleh Kosong");
    } else if (phone.length < 9) {
      setMessage("Nomor Telepon Tidak Boleh Kurang Dari 9 Digit");
    } else if (phone.length > 14) {
      setMessage("Nomor Telepon Tidak Boleh Lebih Dari 14 Digit");
    } else if (validatePhone(phone) === false) {
      setMessage("Format Nomor Telepon Tidak Sesuai");
    } else if (email === "") {
      setMessage("Email Tidak Boleh Kosong");
    } else if (validateEmail(email) === false) {
      setMessage("Format Email Tidak Sesuai");
    } else if (date === "") {
      setMessage("Tanggal Lahir Tidak Boleh Kosong");
    } else if (
      new Date(moment(date)).getTime() > new Date(new Date().setFullYear(new Date().getFullYear() - 10)).getTime()
    ) {
      setMessage("Usia Minimal 10 Tahun");
    } else if (gender === "") {
      setMessage("Gender Tidak Boleh Kosong");
    } else if (desc.length < 10) {
      setMessage("Review Harus Lebih Dari 10 Karakter");
    } else if (selectedSource.label === undefined) {
      setMessage("Mohon isi 'Pernah denger Sukhakala dari mana'");
    } else {
      setMessage("");
    }
  }, [rating, name, phone, email, date, gender, desc, selectedSource]);

  async function fetchPhotoResult(id) {
    const response = await getResult(id);

    if (response.success === 1 || response.success === "1") {
      setIsReviewed(response.isReviewed);
      setIsReviewDiscount(response.isReviewDiscount);

      const defaultMerchant = { label: response.trx_merchant, value: response.trx_merchant_id };

      setSelectedMerchant((prev) => defaultMerchant);

      const forMerchantOptions = response.merchantData?.map((item) => ({ label: item.name, value: item.id }));

      setMasterOptionMerchant((prev) => forMerchantOptions);

      setPhotoResults((prev) =>
        response.data
          .filter((item) => item.type !== "Video")
          .sort((a, b) => {
            return a.type.localeCompare(b.type);
          })
      );

      const forVideo = response.data.filter((item) => item.type === "Video");

      setVideoData((prev) => {
        setLoading((prev) => false);
        return forVideo[0].image_url;
      });

      // load().then(async() => {
      //     await transcode(forVideo[0].image_url)
      //   }
      // )

      setValid((prev) => true);
    } else {
      fetchPhotoResult(id);

      setValid((prev) => false);
    }
  }

  const flexStyle = {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignContent: "flex-start",
  };

  useEffect(() => {
    // if(renderCounter === 0){
    //   setRenderCounter(renderCounter => renderCounter + 1)
    // } else if(renderCounter === 1){
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const uuid = params.get("id");
    fetchPhotoResult(uuid);
    // }
  }, [renderCounter]);

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
      desc,
      merchant: selectedMerchant.value,
      source: selectedSource.label,
      rating: rating,
    };

    const response = await craeteReview(data);

    if (parseInt(response.success) === 1) {
      setVoucher(response.voucherReview);
      const options = { year: "numeric", month: "long", day: "numeric" };
      setValidUntil((prev) => new Date(response.voucherUntil).toLocaleDateString("id-ID", options));
      setFinishReview(true);
    } else if (parseInt(response.success) === 4) {
      setIsReviewed(true);
    }
  }

  return (
    <div
      style={{
        backgroundColor: colorWay.putihBg,
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
          src={responsive(windowWidth.current, asset("memoriesInYourPocket"), asset("memoriesNewUI"))}
          style={{ width: responsive(windowWidth.current, "65vw", "80vw") }}
        />
        <img
          src={responsive(windowWidth.current, asset("followUs"), asset("followUsSmallNewUI"))}
          style={{
            width: responsive(windowWidth.current, "75vw", "90vw"),
            marginTop: responsive(windowWidth.current, "10vh", "2vh"),
          }}
        />
      </div>

      {
        <>
          {loading ? (
            <div
              style={{
                width: "100%",
                textAlign: "center",
                fontFamily: fontString.brushScript,
                fontSize: responsive(windowWidth.current, "10vh", "3vh"),
                marginBottom: makeResponsive("4vh", "2vh"),
              }}
            >
              Loading
            </div>
          ) : (
            <div style={{ ...flexStyle, marginTop: "2vh", marginBottom: "10vh" }}>
              <div style={{ width: "100vw", textAlign: "center" }}>
                <video
                  controls
                  autoPlay={true}
                  loop={true}
                  muted
                  style={{
                    width: makeResponsive("auto", "90vw"),
                    height: makeResponsive("630px", "auto"),
                    objectFit: "cover",
                    border: "none",
                  }}
                >
                  <source src={videoData} type={"video/mp4"} />
                </video>
              </div>
              <DownloadButton link={videoData} current={windowWidth.current} />
            </div>
          )}

          {valid === true ? (
            <div style={{ ...flexStyle, width: "100%" }}>
              <div style={{ ...flexStyle, width: windowWidth.current > 800 ? "60%" : "90%" }}>
                {photoResults.map((item) => {
                  return (
                    <img
                      src={item.image_url}
                      style={{
                        ...flexStyle,
                        width: "Framed" ? "100%" : "auto",
                        height:
                          item.type === windowWidth.current > 800
                            ? "Framed"
                              ? "auto"
                              : "720px"
                            : "Framed"
                            ? "auto"
                            : "40vh",
                        marginTop: "2vh",
                        marginBottom: responsive(windowWidth.current, "5vh", "1vh"),
                        objectFit: "cover",
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            <div
              style={{
                width: "100%",
                textAlign: "center",
                fontFamily: fontString.brushScript,
                fontSize: makeResponsive("10vh", "3vh"),
              }}
            >
              Data Not Found
            </div>
          )}

          {isReviewed ? (
            <div
              style={{
                width: "100%",
                textAlign: "center",
                fontFamily: fontString.sergioTrendy,
                fontSize: makeResponsive("6vh", "2vh"),
                marginTop: makeResponsive("0vh", "2vh"),
              }}
            >
              Anda Telah memberikan Review Untuk Transaksi ini{" "}
              <span style={{ fontFamily: fontString.gentyDemo }}>!</span>{" "}
            </div>
          ) : finishReview ? (
            <>
              <div
                style={{
                  width: "100%",
                  textAlign: "center",
                  fontFamily: fontString.gentyDemo,
                  fontSize: makeResponsive("6vh", "3vh"),
                  marginTop: makeResponsive("0vh", "2vh"),
                }}
              >
                Terima Kasih telah memberikan review<span style={{ fontFamily: fontString.gentyDemo }}>!</span>{" "}
              </div>

              {isReviewDiscount && voucher ? (
                <>
                  <div
                    style={{
                      width: "100%",
                      textAlign: "center",
                      fontFamily: fontString.brushScript,
                      fontSize: makeResponsive("6vh", "2vh"),
                    }}
                  >
                    Ini voucher untuk kamu:{" "}
                  </div>
                  <div
                    style={{
                      width: "100%",
                      textAlign: "center",
                      fontFamily: fontString.robotoFlex,
                      fontSize: makeResponsive("15vh", "4vh"),
                    }}
                  >
                    {voucher}
                  </div>
                  <div
                    style={{
                      width: "100%",
                      textAlign: "center",
                      fontFamily: fontString.brushScript,
                      fontSize: makeResponsive("6vh", "2vh"),
                    }}
                  >
                    Berlaku sampai: {validUntil}
                  </div>
                </>
              ) : (
                <></>
              )}
            </>
          ) : (
            <div
              style={{
                backgorundColor: colorWay.putih,
                width: "100%",
                display: "flex",
                flexWrap: "wrap",
                alignSelf: "flex-start",
                justifyContent: "center",
              }}
            >
              <img
                src={asset("customerReview")}
                style={{
                  width: makeResponsive("45vw", "80vw"),
                  marginTop: makeResponsive("12vh", "4vh"),
                  marginBottom: isReviewDiscount ? "1vh" : "7vh",
                }}
              />
              {isReviewDiscount ? (
                <>
                  <p
                    style={{
                      fontFamily: "sergioTrendy",
                      width: "100%",
                      textAlign: "center",
                      marginBottom: makeResponsive("6vh", "2vh"),
                    }}
                  >
                    Isi review untuk mendapatkan voucher
                  </p>
                </>
              ) : (
                <></>
              )}
              <div
                style={{
                  width: makeResponsive("65%", "90%"),
                  display: "flex",
                  flexWrap: "wrap",
                  alignSelf: "flex-start",
                  justifyContent: "center",
                }}
              >
                <Rating name={"Rating"} setter={setRating} setted={rating} clientWidth={windowWidth.current} />
                <Input name={"Nama"} setter={setName} setted={name} clientWidth={windowWidth.current} />
                <Input name={"No HP"} setter={setPhone} setted={phone} type={"tel"} clientWidth={windowWidth.current} />
                <Input
                  name={"Email"}
                  setter={setEmail}
                  setted={email}
                  type={"email"}
                  clientWidth={windowWidth.current}
                />
                {/* <Input name={"Tanggal Lahir"} setter={setDateOfBirth} setted={dateOfBirth}/> */}
                <DatePicker name={"Tanggal Lahir"} setter={setDate} setted={date} clientWidth={windowWidth.current} />
                <Selection
                  name={"Gender"}
                  setter={setGender}
                  setted={gender}
                  options={genderOptions}
                  clientWidth={windowWidth.current}
                />
                <Selection
                  name={"Cabang Yang Dikunjungi"}
                  setter={setSelectedMerchant}
                  setted={selectedMerchant}
                  options={masterOptionMerchant}
                  clientWidth={windowWidth.current}
                />
                <Selection
                  name={"Pernah denger Sukhakala dari mana"}
                  setter={setSelectedSource}
                  setted={selectedSource}
                  options={masterOptionSource}
                  clientWidth={windowWidth.current}
                />
                {/* <Input name={"Gender"} setter={setGender} setted={gender}/> */}
                <TextInput setter={setDesc} setted={desc} clientWidth={windowWidth.current} name={"Review"} />
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
                    rating === 0 ||
                    selectedSource.value === "" ||
                    name === "" ||
                    validatePhone(phone) === false ||
                    validateEmail(email) === false ||
                    date === "" ||
                    gender === "" ||
                    desc.length < 10
                  }
                  onClick={(e) => {
                    submitReview();
                  }}
                >
                  <img style={{ height: "inherit", width: "inherit" }} src={asset("submit")} />
                </button>
                <p
                  style={{
                    fontFamily: "sergioTrendy",
                    color: "red",
                    width: "100%",
                    textAlign: "center",
                    marginBottom: makeResponsive("6vh", "2vh"),
                    fontSize: makeResponsive("2vh", "1vh"),
                  }}
                >
                  {message}
                </p>
              </div>
            </div>
          )}
        </>
      }
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      <Footer clientWidth={windowWidth.current} clientHeight={windowHeight.current} />
    </div>
  );
}
