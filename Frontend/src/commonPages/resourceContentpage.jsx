import './resourceContentPage.css';
import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

const mimeTypes = {
    // Application types
    json: "application/json",
    pdf: "application/pdf",
    xml: "application/xml",
    zip: "application/zip",
    gzip: "application/gzip",
    doc: "application/msword",
    xls: "application/vnd.ms-excel",
    ppt: "application/vnd.ms-powerpoint",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    tar: "application/x-tar",
    "7z": "application/x-7z-compressed",
    rar: "application/x-rar-compressed",
    swf: "application/x-shockwave-flash",
    js: "application/javascript",
    bin: "application/octet-stream",
    bz: "application/x-bzip",
    bz2: "application/x-bzip2",
    csh: "application/x-csh",
    php: "application/x-httpd-php",
    jar: "application/java-archive",
    rtf: "application/rtf",
    abw: "application/x-abiword",
    arc: "application/x-freearc",
    azw: "application/vnd.amazon.ebook",
    xul: "application/vnd.mozilla.xul+xml",
    exe: "application/vnd.microsoft.portable-executable",
    form: "application/x-www-form-urlencoded",

    // Image types
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    bmp: "image/bmp",
    tiff: "image/tiff",
    ico: "image/vnd.microsoft.icon",
    heic: "image/heic",
    heif: "image/heif",
    xbm: "image/x-xbitmap"
};


function ResourceContentPage() {

    const [urlSearchParams, _] = useSearchParams();

    const resourceKey = decodeURIComponent(urlSearchParams.get("resourceKey"));
    const isNotes = Boolean(urlSearchParams.get("isNotes"));
    const classId=urlSearchParams.get("classId");
    const splitArray = resourceKey.split('.');
    const contentType = splitArray[splitArray.length - 1];

    const contentURL = !isNotes ? `http://localhost:4000/class/resource-content?resourceKey=${encodeURIComponent(resourceKey)}&contentType=${mimeTypes[contentType]}`:`http://localhost:4000/class/notes-content/${classId}`;

    return (
        <div className="resource_content_page">
            <embed src={contentURL} type={mimeTypes[contentType]} style={{ width: "100vw", height: "100vh" }} />
        </div>
    )
}

export default ResourceContentPage;