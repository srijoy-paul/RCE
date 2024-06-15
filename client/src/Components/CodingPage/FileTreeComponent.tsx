type Props = any;
const FileTreeNode = ({ fileName, nodes, onSelect, path }: Props) => {
  const isDir = !!nodes;
  return (
    <div
      className="ml-3"
      onClick={(e) => {
        e.stopPropagation();
        if (isDir) return;
        onSelect(path);
        // socket.emit("file:fetch", path);
      }}
    >
      {fileName}
      {nodes && (
        <ul className="">
          {Object?.keys(nodes)?.map((child: any) => (
            <li className="cursor-pointer " key={child}>
              <FileTreeNode
                path={path + "/" + child}
                fileName={child}
                nodes={nodes[child]}
                onSelect={onSelect}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

function FileTreeComponent({ tree, onSelect }) {
  return (
    <div className="h-[100%] overflow-y-scroll">
      <FileTreeNode onSelect={onSelect} fileName="/" nodes={tree} path="" />
    </div>
  );
}

export default FileTreeComponent;
