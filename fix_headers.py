filepath = r'D:\deep clothes\client\src\pages\admin\AdminOrders.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace headers
text = text.replace('>Order Status</th>', '>Order</th>')
text = text.replace('>Pay Status</th>', '>Payment</th>')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(text)
print('Fixed headers!')
