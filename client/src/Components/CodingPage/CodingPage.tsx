import { useEffect, useState } from "react";
import TerminalComponent from "../Terminal/TerminalComponent";
import FileTreeComponent from "./FileTreeComponent";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";

import { useNavigate, useSearchParams } from "react-router-dom";
import useSocket from "../../Sockets";

function CodingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [fileTree, setFileTree] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const replId = searchParams.get("replId") ?? "";
  const socket = useSocket(replId);
  // const [selectedFileContent, setSelectedFileContent] = useState();
  const [code, setCode] = useState("");
  // const isSaved = code === selectedFileContent;
  if (!replId || replId == "") {
    navigate("/");
  }

  const getFileTree = async () => {
    const response = await fetch(
      `http://localhost:3030/files?replId=${replId}`
    );
    if (!response.ok) throw new Error("Error while generating file tree");
    const parsedRes = await response.json();
    console.log(parsedRes);

    setFileTree(parsedRes);
  };

  useEffect(() => {
    getFileTree();
  }, []);

  useEffect(() => {
    socket?.on("file:refresh", getFileTree);
    return () => {
      socket?.off("file:refresh", getFileTree);
    };
  }, []);

  useEffect(() => {
    setCode("");
  }, [selectedFile]);

  //getfilecontent useEffect
  useEffect(() => {
    (async () => {
      if (!selectedFile) return;
      const response = await fetch(
        `http://localhost:3030/files/content?path=${selectedFile}`
      );
      const parsedResponse = await response.json();
      console.log(parsedResponse);
      setCode(parsedResponse.fileContent);
    })();
  }, [selectedFile]);

  // useEffect(() => {
  //   if (selectedFile && selectedFileContent) {
  //     setCode(selectedFileContent);
  //   }
  // }, [selectedFile, selectedFileContent]);

  //debounce untill user writes within 5 seconds
  useEffect(() => {
    if (code) {
      const timer = setTimeout(() => {
        socket?.emit("file:save", {
          filePath: selectedFile,
          code: code,
        });
      }, 5000);

      // when it will unmount
      return () => {
        clearTimeout(timer);
      };
    }
  }, [code]);

  // useEffect(() => {
  //   if (code === selectedFileContent) {
  //     setIsSaved(true);
  //   } else {
  //     setIsSaved(false);
  //   }
  // }, [code]);

  const onChangeHandler = (e) => {
    //save code on to the server storage
    setCode(e);
  };

  return (
    <>
      <div className="flex flex-col w-full h-screen ">
        <div className="flex h-[70%]" style={{ flex: "4" }}>
          <div className="h-[100%]" style={{ flex: "1" }}>
            <FileTreeComponent
              onSelect={(path) => setSelectedFile(path)}
              tree={fileTree}
            />
          </div>
          <div className="flex flex-col h-full " style={{ flex: "5" }}>
            <span className="text-xs h-[5%] flex items-center">
              {selectedFile && selectedFile}
            </span>
            <AceEditor
              mode="javascript"
              theme="github"
              value={code}
              onChange={(e) => onChangeHandler(e)}
              name="editor"
              style={{
                width: "100%",
                height: "95%",
                // border: "1px solid green",
                overflowY: "scroll",
              }}
            />
          </div>
        </div>
        <div className="h-[30%]" style={{ flex: "1" }} id="xterm-container">
          <TerminalComponent socket={socket} />
        </div>
      </div>
    </>
  );
}

export default CodingPage;
