import { useEffect, useState } from "react";
import "./App.css";
import TerminalComponent from "./Components/Terminal/TerminalComponent";
import FileTreeComponent from "./Components/Terminal/FileTreeComponent";
import socket from "./Sockets";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";

function App() {
  const [fileTree, setFileTree] = useState({});
  const [selectedFile, setSelectedFile] = useState();
  const [selectedFileContent, setSelectedFileContent] = useState();
  const [code, setCode] = useState("");
  const [isSaved, setIsSaved] = useState(selectedFileContent === code);

  const getFileTree = async () => {
    const response = await fetch("http://localhost:3030/files");
    const parsedRes = await response.json();
    console.log(parsedRes);

    setFileTree(parsedRes);
  };

  useEffect(() => {
    getFileTree();
  }, []);

  useEffect(() => {
    socket.on("file:refresh", getFileTree);
    return () => {
      socket.off("file:refresh");
    };
  }, []);

  //getfilecontent useEffect
  useEffect(() => {
    (async () => {
      if (!selectedFile) return;
      const response = await fetch(
        `http://localhost:3030/files/content?path=${selectedFile}`
      );
      const parsedResponse = await response.json();
      console.log(parsedResponse);
      setSelectedFileContent(parsedResponse.fileContent);
    })();
  }, [selectedFile]);

  useEffect(() => {
    if (selectedFile && selectedFileContent) {
      setCode(selectedFileContent);
    }
  }, [selectedFileContent]);

  //debounce untill user writes within 5 seconds
  useEffect(() => {
    if (code && !isSaved) {
      const timer = setTimeout(() => {
        socket.emit("file:save", {
          path: selectedFile,
          code: code,
        });
      }, 5000);

      // when it will unmount
      return () => {
        clearTimeout(timer);
      };
    }
  }, [code]);

  useEffect(() => {
    if (code === selectedFileContent) {
      setIsSaved(true);
    } else {
      setIsSaved(false);
    }
  }, [code]);

  const onChangeHandler = (e) => {
    //save code on to the server storage
    setCode(e);
  };

  return (
    <>
      <div className="flex flex-col w-full h-screen ">
        <div className="flex" style={{ flex: "4" }}>
          <div style={{ flex: "1" }}>
            <FileTreeComponent
              onSelect={(path) => setSelectedFile(path)}
              tree={fileTree}
            />
          </div>
          <div className="" style={{ flex: "5" }}>
            {selectedFile && selectedFile}
            <AceEditor
              mode="javascript"
              theme="github"
              value={code}
              onChange={(e) => onChangeHandler(e)}
              name="editor"
              style={{ width: "100%" }}
            />
          </div>
        </div>
        <div className="" style={{ flex: "1" }} id="xterm-container">
          <TerminalComponent />
        </div>
      </div>
    </>
  );
}

export default App;
