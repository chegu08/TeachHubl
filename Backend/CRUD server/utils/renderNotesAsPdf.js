const { createCanvas } = require("canvas");

function renderNotesAsPdf(pages) {
    const width = 1200;
    const height = 800;

    const canvas = createCanvas(width, height, "pdf");
    const ctx = canvas.getContext("2d");

    const totalPages = pages.length;

    for (let i = 0; i < totalPages; i++) {
        // Set background to white
        ctx.save();
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, height);
        ctx.restore();

        const elements = pages[i];
        for (const element of elements) {
            if (element.type === "pencil") {
                ctx.beginPath();

                element.path.forEach(([x, y], index) => {
                    if (index === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });

                ctx.strokeStyle = element.stroke;
                ctx.lineWidth = 1;
                ctx.stroke();

            } else if (element.type === "line") {
                ctx.beginPath();

                ctx.moveTo(element.offsetX, element.offsetY);
                ctx.lineTo(element.width, element.height);

                ctx.strokeStyle = element.stroke;
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // rectangle logic — to be added later
        }

        // Only add page if there is another page
        if (i !== totalPages - 1) {
            ctx.addPage();
        }
    }

    const stream = canvas.createPDFStream();
    return stream;
}

module.exports = {
    renderNotesAsPdf
};
