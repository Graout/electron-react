import React, { Component } from "react";
import {
    dateFormat,
    getRandomInt,
    customSort,
    changeSaveButton
} from "./todo-func-exports";
const Store = window.require("electron-store");
const save = new Store({ name: "save" });
const settings = new Store({
    name: "settings"
});
export default class home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            todos: [
                {
                    name: "",
                    key: "",
                    date: "",
                    text: ""
                }
            ],
            currentItem: ""
        };
    }

    componentDidMount() {
        const test = save.get("todos");
        this.setState({
            todos: test
        });
    }

    loadSettings = () => {
        const fontSize = settings.get("Font_size");
        document.querySelector(".text").style.fontSize = `${fontSize}pt`;
    };

    removeItem = item => {
        const text = document.querySelector(".text");
        this.setState({
            todos: this.state.todos.filter(todo => todo.key !== item.target.id)
        });
        save.set({
            todos: this.state.todos.filter(todo => todo.key !== item.target.id)
        });
        text.value = "";
        text.style.pointerEvents = "none";
        text.placeholder = "select a todo and enter some text";
    };

    addtodo = () => {
        if (this.state.currentItem !== "") {
            const num = getRandomInt(10000).toString();
            this.setState({
                todos: [
                    {
                        name: this.state.currentItem,
                        key: num,
                        date: dateFormat(),
                        text: ""
                    },
                    ...this.state.todos
                ],
                currentItem: ""
            });
            document.querySelector(".input-item").value = "";
        }
    };

    enterKeyPressed = target => {
        if (target.charCode === 13) {
            this.addtodo();
        }
    };

    setActive = item => {
        const text = document.querySelector(".text");
        const active = document.querySelector(".active-li");
        document.querySelector(".savebtn").innerHTML = "Save";
        console.log();
        if (active === null) {
            text.focus();
            text.style.pointerEvents = "auto";
            text.placeholder = "Add some text...";
            document.getElementById(item.target.id).className = "active-li";
        } else if (active.id !== item.target.id) {
            text.focus();
            document.getElementById(item.target.id).className = "active-li";
            document.getElementById(active.id).className = "";
        }
        save.get("todos").map(e => {
            const id = document.querySelector(".active-li").id;
            if (e.key === id) {
                text.value = e.text;
            }
            return 0;
        });
    };

    getList = items =>
        items.map((item, i) => (
            <li
                id={`${item.key}`}
                key={`${item.key}`}
                onDoubleClick={this.removeItem}
                onClick={this.setActive}
            >
                {item.name}

                <span className="date">{item.date}</span>
            </li>
        ));

    saveText = item => {
        const text = document.querySelector(".text").value;
        const id = document.querySelector(".active-li").id;
        this.state.todos.filter(e => {
            if (e.key === id) {
                this.setState(prevState => ({
                    todos: [
                        {
                            ...e,
                            text: text
                        },
                        ...prevState.todos.filter(e => e.key !== id)
                    ]
                }));
            }
            return 0;
        });
        const notSavedbtn = document.querySelector(".savebtn");
        notSavedbtn.innerHTML = "Saved";
    };

    componentDidUpdate() {
        this.state.todos.sort(customSort);
        save.set({ todos: this.state.todos });
    }

    onChange = e => {
        this.setState({ currentItem: e.target.value });
    };

    render() {
        return (
            <div id="main" className="wrapper-todos">
                <div id="box-background-color" className="box-1">
                    <section>
                        <input
                            onChange={e => this.onChange(e)}
                            maxLength="20"
                            onKeyPressCapture={this.enterKeyPressed}
                            type="text"
                            className="input-item"
                            placeholder="Add someting to do! limit 20 char"
                        />
                        <button className="add-btn" onClick={this.addtodo}>
                            Add
                        </button>
                    </section>
                    <ul>{this.getList(this.state.todos)}</ul>
                </div>
                <div id="box-background-color" className="box-2">
                    <textarea
                        placeholder="select a todo and enter some text"
                        className="text"
                        onChange={changeSaveButton}
                    />
                    <button className="savebtn" onClick={this.saveText}>
                        Save
                    </button>
                </div>
            </div>
        );
    }
}
