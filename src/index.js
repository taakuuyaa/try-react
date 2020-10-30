import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// class Square extends React.Component {
//     constructor(props) {
//         /*
//             なぜ`super(props)`を記述するのか？
//             親（React.Component）のコンストラクタが
//             実行されてからでないと`this`が使えないから。
//             https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Classes#Sub_classing_with_extends
//         */
//         super(props);
//         this.state = {
//             value: null,
//         };
//     }
//
//     render() {
//     return (
//       <button
//           className="square"
//           onClick={() => this.props.onClick()}
//       >
//         {this.props.value}
//       </button>
//     );
//   }
// }

function Square(props) {
    return (
        <button className={`square ${props.isHighlight ? 'highlight' : ''}`} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
          key={i}
          value={this.props.squares[i]}
          onClick={() => this.props.onClick(i)}
          isHighlight={this.props.highlightSquares.includes(i)}
      />
    );
  }

  render() {
    return (
      <div>
        {
          Array(3).fill(0).map((row, i) => {
            return (
                <div className="board-row" key={i}>
                  {
                    Array(3).fill(0).map((col, j) => {
                      return(
                          this.renderSquare(i * 3 + j)
                      )
                    })
                  }
                </div>
            )
          })
        }
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        col: null,
        row: null,
      }],
      stepNumber: 0,
      xIsNext: true,
      isAsc: true,
    };
  }

  handleClick(i){
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        col: (i % 3) + 1,
        row: Math.floor(i / 3) + 1,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    })
  }

  toggleOrder() {
    this.setState({
      isAsc: !this.state.isAsc
    })
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const result = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const col = step.col
      const row = step.row
      const desc = move ?
          `Go to move #${move}(${col},${row})` :
          `Go to move start`;
      return (
          <li key={move} >
            <button
                onClick={() => this.jumpTo(move)}
                className={this.state.stepNumber === move ? 'bold' : ''}
            >
              {desc}
            </button>
          </li>
      )
    })
    let status;
    if (result) {
      status = result.isDraw ? 'Draw' : `Winner: ${result.winner}`
    } else {
      status = `Next player: ${this.state.xIsNext ? 'X' : 'O'}`;
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            highlightSquares={result ? result.winLine : []}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div><button onClick={() => this.toggleOrder()}>ASC⇔DESC</button></div>
          <ol>{this.state.isAsc ? moves : moves.reverse()}</ol>
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {
              winner: squares[a],
              winLine: [a, b, c]
            };
        }

      // nullが含まれているか（まだ空のSquareがあるか判定）
      if (!squares.includes(null)) {
        return {
          isDraw: true,
          winner: null,
          winLine: []
        }
      }
    }
    return null;
}