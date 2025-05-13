import './whiteBoard.css'
import { useEffect, useLayoutEffect, useState, useRef } from 'react';
import rough from 'roughjs';
import axios from 'axios'
import { jsPDF } from 'jspdf'
const roughGenerator = rough.generator();
const database = 'http://localhost:4002'

const WhiteBoard = ({ tool, socket, color, whiteboardId ,user,roomId}) => {
    const [elements, setElements] = useState([])

    //const socket=useRef(Socket).current;
    const canvasRef = useRef(null)
    const ctxRef = useRef(null)
    const [isDrawing, setIsDrawing] = useState(false);
    console.log(`Came into : ${whiteboardId}`)

    useEffect(() => {
        async function FillCanvas(classId) {
            const currentCanvasElements = (await axios.get(`${database}/${classId}/${whiteboardId}`)).data.elements
            setElements(currentCanvasElements)
        }
        FillCanvas("class2")
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.height = window.innerHeight * 2;
        canvas.width = window.innerWidth * 2;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = "white";
        ctxRef.current = ctx;
    }, [canvasRef, ctxRef]);

    useEffect(() => {
        const handleSocketData = (data) => {
            if (whiteboardId === data.imageURL.whiteboardId) {
                const { mouseState, element } = data.imageURL;
                if (mouseState === 'Down') {
                    setElements((prev) => [...prev, element]);
                } else if (mouseState === 'moving') {
                    setElements((prev) =>
                        prev.map((el, idx) => (idx === elements.length - 1 ? element : el))
                    );
                }
            }

        };

        socket.on('WhiteBoardDataResponse', handleSocketData);
        return () => {
            socket.off('WhiteBoardDataResponse', handleSocketData);
        };
    }, [socket, elements?.length]);

    useLayoutEffect(() => {
        //if(!canvasRef){return}
        const roughCanvas = rough.canvas(canvasRef.current);

        if (ctxRef?.current) {
            ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        }

        elements.forEach((element) => {
            //const options = { stroke: color };
            if (element.type === 'pencil') {
                roughCanvas.linearPath(element.path, { stroke: element.stroke });
            } else if (element.type === 'line') {
                roughCanvas.draw(roughGenerator.line(element.offsetX, element.offsetY, element.width, element.height, { stroke: element.stroke }));
            } else if (element.type === 'rectangle') {
                roughCanvas.draw(roughGenerator.rectangle(element.offsetX, element.offsetY, element.width, element.height, { stroke: element.stroke }));
            }
        });
    }, [elements, canvasRef]);

    const handleMouseDown = (e) => {
        const { offsetX, offsetY } = e.nativeEvent;
        const newElement = {
            type: tool,
            offsetX,
            offsetY,
            path: tool === 'pencil' ? [[offsetX, offsetY]] : undefined,
            width: (tool === 'line') ? offsetX : 0,
            height: (tool === 'line') ? offsetY : 0,
            stroke: color,
        };
        setElements((prev) => [...prev, newElement]);
        socket.emit('WhiteBoardData', { mouseState: 'Down', element: newElement, whiteboardId,roomId });
        setIsDrawing(true);
    };

    const handleMouseMove = (e) => {
        if (!isDrawing) return;

        const { offsetX, offsetY } = e.nativeEvent;
        setElements((prev) =>
            prev.map((el, idx) =>
                idx === elements.length - 1
                    ? {
                        ...el,
                        path: tool === 'pencil' ? [...el.path, [offsetX, offsetY]] : el.path,
                        width: tool !== 'pencil' ? (tool === 'line' ? offsetX : offsetX - el.offsetX) : el.width,
                        height: tool !== 'pencil' ? (tool === 'line' ? offsetY : offsetY - el.offsetY) : el.height,
                    }
                    : el
            )
        );

        socket.emit('WhiteBoardData', { mouseState: 'moving', element: elements[elements.length - 1], whiteboardId,roomId });
    };

    const handleMouseUp = () => setIsDrawing(false);

    const SaveCanvasAsPage = async () => {
        try {
            const contentsOfCanvas = elements
            //console.log(contentsOfCanvas)
            const response = await axios.post(`${database}/class2/${whiteboardId}`,
                {
                    page: contentsOfCanvas

                }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            //console.log(response)
        }
        catch (err) {
            console.log(err)
        }
    }



    const [imageSrc, setImageSrc] = useState(null);

    const handleConvertToImage = () => {
        const canvas = canvasRef.current;

        if (canvas) {
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);

                // Set the image source to React state
                setImageSrc(url);

                // Clean up the object URL once the component unmounts
                return () => URL.revokeObjectURL(url);
            }, 'image/png');
        }
    };

    const handleDownload = () => {
        const pdf = new jsPDF("landscape", "px", "a4"); // Create a new PDF instance

        // Add the image to the PDF at position (10, 10) and adjust its size
        pdf.setFillColor(255, 255, 255);
        pdf.addImage(imageSrc, "JPEG", 10, 10, canvasRef.current.width / 2 - 100, canvasRef.current.height - 100); // X, Y, Width, Height
        pdf.save("canvas-output.pdf"); // Trigger the download with the filename
    }

    return (
        <>
            
                {/* Page Number: {whiteboardId+1} */}
                <div className='options-container'>
                    <button className='btn btn-primary mt-1' onClick={(event) =>
                        setElements((pre) => pre.slice(0, -1))
                    }>Undo</button>
                    {/* <button className='btn btn-outline-primary mt-1'>Redo</button> */}
                
            
                    <button className="btn btn-danger" onClick={() => {
                        setElements((prev) => []);
                        ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
                    }}>Clear canvas</button>
                    <button className='btn btn-primary' onClick={() => {
                        SaveCanvasAsPage()
                    }}>Save</button>
                
                <button onClick={handleConvertToImage} className='btn btn-primary'>Convert to Image</button>
                {imageSrc && (
                    <>
                        {/* <img src={imageSrc} alt="Generated from canvas" height={canvasRef.current.height} width={canvasRef.current.width}/> */}
                        {/* <a
            href={imageSrc}
            download="canvas-image.pdf"
            style={{
              display: "inline-block",
              marginTop: "10px",
              textDecoration: "none",
              backgroundColor: "#4CAF50",
              color: "white",
              padding: "8px 16px",
              borderRadius: "4px",
            }}
          >
            Download Image
          </a>
          */}
                        <button className='btn btn-primary margin-1' onClick={handleDownload}>Download as pdf</button>
                    </>
                )}


            </div>

            <div
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="canvas-container"
            >

                <canvas ref={canvasRef} className='canvas'/>
            </div>
        </>

    );
};

export default WhiteBoard;
