import React, { Component, Fragment } from "react";
import api from "api";
import Auth from "components/Auth";
import storage from "storage";
import { isEmpty } from "lodash";
import Slider from "react-slick";
import { Helmet } from "react-helmet";
import {
  Box,
  Card,
  Container,
  Flex,
  Label,
  Heading,
  Link as A,
  Text,
  Section,
  Image,
  Button,
  IconButton,
  BackgroundImage,
  Loading,
  Input,
  theme
} from "@hackclub/design-system";

class CarouselProject extends Component {
  state = { status: "loading" };

  onClickImage() {
    console.log("Clicking Image");
    return;
    const { live_url } = this.props.project;
    window.open(live_url, "_blank");
  }

  render() {
    const { project, isOriginal = false, liveFrame = false } = this.props;
    const { author = "???", live_url, code_url, screenshot } = project;

    const onClickImage = this.onClickImage.bind(this);
    const authorString = isOriginal
      ? `Original by ${author}`
      : `Rehacked by ${author}`;

    const imageUrl = liveFrame
      ? (function() {
          const url = live_url;
          const accessKey = "d7d3cada424e0439f48de1a1b50160dd";
          return `http://api.screenshotlayer.com/api/capture?access_key=${accessKey}&url=${url}&viewport=1440x900&format=PNG`;
        })()
      : "http://api.hackclub.com" + screenshot.file_path;

    return (
      <Flex
        m={1}
        p={4}
        bg="#FFF"
        style={{
          borderRadius: 5,
          flexBasis: 0,
          flexGrow: 1,
          flexShrink: 1,
          flexDirection: "column"
        }}
      >
        <Heading.h4
          m={1}
          style={{
            alignSelf: isOriginal ? "flex-end" : "flex-start"
          }}
        >
          {authorString}
        </Heading.h4>
        <Box
          m={1}
          style={{
            paddingBottom: "50%",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <Image
            src={imageUrl}
            onClick={onClickImage}
            style={{
              objectFit: "cover",
              cursor: "Pointer",
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            }}
          />
        </Box>
        <A href={live_url} />
        <A href={code_url}>Code!</A>
      </Flex>
    );
  }
}

class CarouselSubmissionForm extends Component {
  onClickSubmitButton() {
    console.log("Clicking Submit Button");
    const { workshopSlug, userEmail, submissionData } = this.props;
    const { liveUrl, codeUrl } = submissionData;

    return fetch(
      "https://api.hackclub.com/v1/workshops/" + workshopSlug + "/projects",
      {
        method: "POST",
        body: JSON.stringify({
          live_url: liveUrl,
          code_url: codeUrl
          // screenshot_id: screenshotId
        }),
        headers: {
          "Content-Type": "application/json"
        }
      }
    ).then(resp => resp.json());
  }

  onChangeLiveURL(event) {
    const liveUrl = event.target.value;
    const { submissionData } = this.props;
    this.props.setSubmissionData({ ...submissionData, liveUrl });
  }

  onChangeCodeURL(event) {
    const codeUrl = event.target.value;
    const { submissionData } = this.props;
    this.props.setSubmissionData({ ...submissionData, codeUrl });
  }

  render() {
    const { workshopSlug, userEmail, submissionData } = this.props;
    const { liveUrl, codeUrl } = submissionData;

    const authed = !isEmpty(userEmail);

    const onClickSubmitButton = this.onClickSubmitButton.bind(this);
    const onChangeLiveURL = this.onChangeLiveURL.bind(this);
    const onChangeCodeURL = this.onChangeCodeURL.bind(this);

    const disableSubmission = liveUrl == "" || codeUrl == "";

    return (
      <Flex
        p={4}
        bg="#FFF"
        style={{
          margin: 10,
          borderRadius: 5,
          flexGrow: 1,
          flexShrink: 1,
          flexDirection: "column",
          alignSelf: "center"
        }}
      >
        <Auth headline={"Are you human?"} style={{ flexGrow: 1 }} />
        {!authed ? null : (
          <Fragment>
            <Flex m={1} style={{ alignItems: "center" }}>
              <Label style={{ width: 150 }}>Live URL</Label>
              <Input
                placeholder="(where's the final product?)"
                value={liveUrl}
                onChange={onChangeLiveURL}
              />
            </Flex>
            <Flex m={1} style={{ alignItems: "center" }}>
              <Label style={{ width: 150 }}>Code URL</Label>
              <Input
                placeholder="(where's the code?)"
                value={codeUrl}
                onChange={onChangeCodeURL}
              />
            </Flex>
            <Button
              m={1}
              disabled={disableSubmission}
              onClick={disableSubmission ? null : onClickSubmitButton}
              style={{ flexGrow: 1 }}
            >
              Submit My Thing
            </Button>
          </Fragment>
        )}
      </Flex>
    );
  }
}

class Carousel extends Component {
  state = {
    autoplay: false,
    projectIndex: 0,
    submitting: false,
    submissionData: {
      liveUrl: "",
      codeUrl: ""
    },
    userEmail: "",
    liveFrameStatus: "empty",
    liveFrameImage: null
  };

  constructor(props) {
    super(props);

    const { slug } = props;
    console.log("Slug is " + slug);

    const userEmail = storage.get("userEmail");
    this.state.userEmail = userEmail;

    const exampleData = {
      author: "msw",
      live_url: "https://zachlatta.github.io",
      code_url: "https://github.com/zachlatta/zachlatta.github.io",
      screenshot: {
        id: 4,
        created_at: "2018-04-13T03:18:50.716Z",
        updated_at: "2018-04-13T03:19:06.553Z",
        type: "workshop_project_screenshot",
        file_path:
          "/rails/active_storage/variants/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBc2dMIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--6f1d52341ad5ccaccbb2b3a4b1b191d57fd531b4/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdERG9LYzNSeWFYQlVPZzVwYm5SbGNteGhZMlZKSWdwUWJHRnVaUVk2QmtWVU9oSm5ZWFZ6YzJsaGJsOWliSFZ5Wmdrd0xqQTFPZ3h4ZFdGc2FYUjVTU0lJT0RVbEJqc0hWRG9MWkdWbWFXNWxTU0lhYW5CbFp6cGtZM1F0YldWMGFHOWtQV1pzYjJGMEJqc0hWRG9VYzJGdGNHeHBibWRmWm1GamRHOXlTU0lLTkRveU9qQUdPd2RVT2d0eVpYTnBlbVZKSWdrMU1EQjRCanNIVkE9PSIsImV4cCI6bnVsbCwicHVyIjoidmFyaWF0aW9uIn19--7d4c10d23979a9bcafff7ea8da85dcefd2837226/Screenshot%202018-04-12%2020.18.17.png"
      }
    };

    this.state.original = { ...exampleData };
    this.state.projects = [
      { ...exampleData },
      { ...exampleData },
      { ...exampleData }
    ];

    api.get(`v1/workshops/${slug}/projects`).then(projects => {
      this.setState({
        projects
      });
    });
  }

  setLiveFrameStatus(liveFrameStatus) {
    this.setState({ liveFrameStatus });
  }

  setSubmissionData(submissionData) {
    // disabled Live Frame feature for now, since screenshotlayer free tier limits us here
    this.setLiveFrameStatus(submissionData.liveUrl == "" ? "empty" : "loading");
    this.setState({ submissionData });
  }

  onClickSubmitButton() {
    const { projects, projectIndex, autoplay } = this.state;
    if (autoplay) this.cancelAutoplay();
    this.setState({ submitting: true });
  }

  setProjectIndex(index) {
    const { projects, projectIndex } = this.state;
    index = Math.min(index, projects.length - 1);
    index = Math.max(index, 0);
    this.setState({ projectIndex: index });
  }

  nextProject() {
    console.log("Showing Next Rehack");
    const { projects, projectIndex } = this.state;
    this.setProjectIndex(projectIndex + 1);
  }

  previousProject() {
    console.log("Showing Previous Rehack");
    const { projects, projectIndex } = this.state;
    this.setProjectIndex(projectIndex - 1);
  }

  onClickNextButton() {
    const { projects, projectIndex, autoplay } = this.state;
    if (autoplay) this.cancelAutoplay();
    this.nextProject();
  }

  onClickPreviousButton() {
    const { projects, projectIndex, autoplay } = this.state;
    if (autoplay) this.cancelAutoplay();
    this.previousProject();
  }

  cancelAutoplay() {
    console.log("Cancelling autoplay");
    this.setState({ autoplay: false });
    clearInterval(this.state.autoplayId);
  }

  beginAutoplay() {
    console.log("Beginning autoplay");
    const cb = this.advanceAutoplay.bind(this);
    const autoplayId = setInterval(cb, 5000);
    this.setState({
      autoplay: true,
      autoplayId
    });
  }

  advanceAutoplay() {
    console.log("Advancing autoplay");
    this.nextProject();
  }

  componentDidMount() {
    this.beginAutoplay();
  }

  render() {
    const { slug } = this.props;
    const {
      original,
      projects,
      projectIndex,
      submissionData,
      userEmail,
      liveFrameStatus,
      liveFrameImage
    } = this.state;

    const onClickNextButton = this.onClickNextButton.bind(this);
    const onClickPreviousButton = this.onClickPreviousButton.bind(this);
    const onClickSubmitButton = this.onClickSubmitButton.bind(this);

    const setSubmissionData = this.setSubmissionData.bind(this);

    const submissionProject =
      liveFrameStatus == "empty"
        ? projects[projectIndex]
        : {
            live_url: submissionData.liveUrl,
            code_url: submissionData.codeUrl,
            screenshot: {}
          };

    const sliderSettings = {
      dots: false,
      vertical: true,
      verticalSwiping: true,
      infinite: true,
      speed: 500,
      autoplay: true,
      autoplaySpeed: 2000,
      slidesToShow: 1,
      slidesToScroll: 1
    };

    return (
      <Box bg="#EEE" p={4}>
        <Helmet>
          <link
            rel="stylesheet"
            type="text/css"
            charset="UTF-8"
            href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css"
          />
          <link
            rel="stylesheet"
            type="text/css"
            href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css"
          />
        </Helmet>
        <Flex style={{ flexDirection: "column" }}>
          <Flex justify="space-between" style={{}}>
            <Flex
              style={{
                margin: 0,
                width: "50%",
                flexGrow: 1,
                flexShrink: 1,
                alignSelf: "center",
                overflow: "hidden",
                position: "relative"
              }}
            >
              <CarouselProject project={original} isOriginal={true} />
            </Flex>

            <Flex
              style={{
                margin: 0,
                width: "50%",
                flexDirection: "column",
                flexShrink: 1,
                alignSelf: "stretch",
                overflow: "hidden",
                position: "relative"
              }}
            >
              {liveFrameStatus != "empty" ? (
                <CarouselProject
                  liveFrame
                  project={submissionProject}
                  isOriginal={false}
                />
              ) : (
                <Slider
                  {...sliderSettings}
                  style={{
                    margin: 0,
                    flexBasis: 0,
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0
                  }}
                >
                  {" "}
                  {projects.map(project => (
                    <CarouselProject project={project} isOriginal={false} />
                  ))}
                </Slider>
              )}
            </Flex>
          </Flex>
          <CarouselSubmissionForm
            userEmail={userEmail}
            workshopSlug={slug}
            submissionData={submissionData}
            setSubmissionData={setSubmissionData}
          />
        </Flex>
      </Box>
    );
  }
}

export default Carousel;