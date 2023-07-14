const net = require("net");
const event = require("events");

class RemoteConsoleConnection extends event.EventEmitter {
    constructor(ip, port) {
        super();
        this.ip = ip;
        this.port = port;
        this.client = null;

        // Some codes may waste some additional chunks of data
        // so we give a mercy time to the server to send all the data
        // and then process it
        this.timeouts = {
            // [opcode] : timeout index
            6: -1
        }
    }

    connect() {
        return new Promise((resolve, _) => {
            this.client = new net.Socket();
            this.client.setEncoding("latin1");
            this.client.connect(this.port, this.ip, () => {
                resolve({
                    message: "Connected to remote console"
                });

                // Bind data handler
                this.client.on("data", (data) => {
                    this.handleData(data);
                });

                // Bind error handler
                this.client.on("error", (err) => {
                    this.handleError(err);
                });

                // Bind close handler
                this.client.on("close", () => {
                    this.handleClose();
                });
            });
            this.client.on("error", (err) => {
                resolve({
                    error: err.message
                });
            });
        });
    }

    disconnect() {
        this.client.destroy();
    }

    handleData(data) {
        try {

            // https://halo-sapp.readthedocs.io/en/latest/commands/remote.html

            // There could be multiple JSON responses in the same data
            // and they are separated by \n
            data = data.trim();
            data = data.split("\n");

            // We must parse each JSON response bassed on how server formats data
            // which also depends on the opcode
            const firstItem = JSON.parse(data[0]);
            const code = firstItem.opcode;

            switch (code) {
                case 1:
                    // Login case is simple, only one object expected
                    this.emit("data", firstItem);
                    break;
                case 2:
                    // Full query response, there is only one item
                    this.emit("data", firstItem);
                    break;
                case 4:
                    // Full query response, there is only one item
                    this.emit("data", firstItem);
                    break;
                case 5:
                case 6:
                    // Command executed with a response, lets join the whole response
                    // we know already that the last data is the command status (opCode 5)
                    // so we can add it as well into a custom object

                    const lastItem = JSON.parse(data[data.length - 1]);

                    // We got a partialized command response if the last item is not a command status
                    // later chunks will include command status (code 5)
                    // so we just have to send the current data
                    // and then the rest will be sent on another chunk
                    const dataLength = (lastItem.opcode !== 5) ? data.length : data.length - 1;

                    let text = "";
                    for (let i = 0; i < dataLength; i++) {
                        const parsedData = JSON.parse(data[i]);
                        text += parsedData.text + "\n";
                    }

                    const commandResponse = {
                        opcode: 5,
                        ret: (lastItem.opcode === 5) ? lastItem.ret : 1,
                        data: text
                    };

                    this.emit("data", commandResponse);

                    break;
                default:
                    // Other cases are more complex, we must parse each object
                    console.log(data);

            }
        } catch (e) {
            console.log(e)
            this.emit("error", "Error getting data from server")
        }
    }

    handleClose() {
        this.emit("close")
    }

    handleError(error) {
        console.log(error)
        this.emit("error", error.message || "error");
    }

    sendCommand(command) {
        // Command is an input in JSON, lets stringify and add a trailing \n
        command = JSON.stringify(command) + "\n";
        this.client.write(command);
    }
}

module.exports = RemoteConsoleConnection;