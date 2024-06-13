import path from "path";

const fs = require("fs");

const { S3 } = require("aws-sdk");

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  endpoint: process.env.S3_ENDPOINT,
});

export async function copyS3Folder(
  sourcePrefix: string,
  destinationPrefix: string,
  continuationToken?: string
): Promise<void> {
  try {
    const listParams = {
      Bucket: process.env.S3_BUCKET ?? "",
      Prefix: sourcePrefix,
      continuationToken: continuationToken,
    };

    const allObjects = await s3.listObjectsV2(listParams).promise();

    if (!allObjects.Contents || allObjects.Contents.length === 0) return;

    await Promise.all(
      allObjects.Contents.map(async (object: any) => {
        if (!object.Key) return;

        let destinationKey = object.Key.replace(
          sourcePrefix,
          destinationPrefix
        );

        let copyParams = {
          Bucket: process.env.S3_BUCKET ?? "",
          CopySource: `${process.env.S3_BUCKET}/${object.Key}`,
          Key: destinationKey,
        };

        await s3.copyObject(copyParams).promise();
        console.log(`Copied ${object.Key} to ${destinationKey}`);
      })
    );
  } catch (error) {
    console.log("Error copying folder: ", error);
  }
}

export async function fetchS3Folder(
  key: string,
  localPath: string
): Promise<void> {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET ?? "",
      Prefix: key,
    };
    console.log("current folder content fetch params", params);

    const response = await s3.listObjectsV2(params).promise();
    // console.log(response);
    if (response.Contents) {
      await Promise.all(
        response.Contents.map(async (file: any) => {
          const fileKey = file.Key;
          if (fileKey) {
            const getObjectParams = {
              Bucket: process.env.S3_BUCKET ?? "",
              Key: fileKey,
            };

            const data = await s3.getObject(getObjectParams).promise();
            // console.log("fetched object data", data);

            if (data.Body) {
              const fileData = data.Body;
              // console.log(fileData);

              const filePath = `${localPath}${fileKey.replace(key, "")}`;
              // console.log("local filepath", filePath);
              console.log("before write file");

              await writeFile(filePath, fileData);
              console.log("after write file");

              console.log(`Downloaded ${fileKey} to ${filePath}`);
            }
          }
        })
      );
    }
  } catch (error) {
    console.log("Error occured while fetching the folder", error);
  }
}

export async function saveToS3(
  key: string,
  filePath: string,
  content: string
): Promise<void> {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET ?? "",
      Key: `${key}${filePath}`,
      Body: content,
    };
    // console.log("save to s3 params", params);

    await s3.putObject(params).promise();
  } catch (error) {
    console.log("error while saving it to s3", error);
  }
}

function writeFile(filePath: string, fileData: Buffer): Promise<void> {
  return new Promise(async (resolve, reject) => {
    await createFolder(path.dirname(filePath));

    fs.writeFile(filePath, fileData, (err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function createFolder(dirName: string) {
  return new Promise<void>(async (resolve, reject) => {
    fs.mkdir(dirName, { recursive: true }, (err: any) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}
