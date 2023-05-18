import * as React from "react"

function MyEntriesIcon({ fill = "#6C7281", ...rest }) {
    return (
        <svg
            width={24}
            height={24}
            fill="none"
            viewBox="0 0 60 60"
            xmlns="http://www.w3.org/2000/svg"
            {...rest}
        >
            <g
                transform="matrix(1.0124 0 0 1.0124 -.37266 -.37266)"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <g transform="matrix(1.0384 0 0 1.0384 -1.1507 -1.1507)">
                    <path
                        d="m11.75 54.375v-48.75h27.688l8.812 8.813v39.937h-36.5z"
                        color="#000000"
                        display="block"
                        fill={fill}
                        // stroke="#fff"
                        strokeWidth="7.1343"
                    />
                    <path
                        d="m11.75 54.375v-48.75h27.688l8.812 8.813v39.937h-36.5z"
                        color="#000000"
                        display="block"
                        fill={fill}
                        stroke="#000"
                        strokeWidth="2.3781"
                    />
                    <path
                        d="m39.437 14.438v-8.813l8.813 8.813h-8.813z"
                        color="#000000"
                        display="block"
                        stroke="#000"
                        fill={fill}
                        strokeWidth="2.3781"
                    />
                </g>
                <path d="m17.21 32.165h25.58" fill={fill} stroke="#000" strokeWidth="2.4693" />
                <path d="m17.21 37.165h25.58" fill={fill} stroke="#000" strokeWidth="2.4693" />
                <path d="m17.21 42.165h25.58" fill={fill} stroke="#000" strokeWidth="2.4693" />
                <path d="m17.21 47.165h25.58" fill={fill} stroke="#000" strokeWidth="2.4693" />
                <path d="m17.21 27.165h25.58" fill={fill} stroke="#000" strokeWidth="2.4693" />
                <path d="m17.21 22.165h25.58" fill={fill} stroke="#000" strokeWidth="2.4693" />
            </g>
        </svg>
    )
}

export default MyEntriesIcon
