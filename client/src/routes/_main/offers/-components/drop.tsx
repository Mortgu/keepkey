import { useDropzone } from 'react-dropzone';
import { tv } from 'tailwind-variants';

const baseStyle = tv({
    base: [
        'mx-8 my-10 p-4 border border-dashed'
    ],
    variants: {
        isFocused: {
            true: 'border-blue-500',
            false: ''
        },
        isDragAccept: {
            true: 'border-green-500',
            false: ''
        },
        isDragReject: {
            true: 'border-red-500',
            false: ''
        },
    }
});

export default function MyDropzone() {
    const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } = useDropzone({
        accept: { "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [] },
        onDrop: acceptedFiles => {
            console.log(acceptedFiles);
        }
    });




    return (
        <div {...getRootProps()} className={baseStyle({ isFocused, isDragAccept, isDragReject })}>
            <input {...getInputProps()} />
            <p>Drag 'n' drop some files here, or click to select files</p>
        </div>
    )
}