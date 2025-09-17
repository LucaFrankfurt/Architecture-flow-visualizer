/**
 * Architecture Data Templates
 * Contains predefined architecture patterns and sample data
 */

class ArchitectureData {
    static getTemplate(templateName) {
        const templates = {
            microservices: this.getMicroservicesTemplate(),
            layered: this.getLayeredTemplate(),
            'event-driven': this.getEventDrivenTemplate(),
            hexagonal: this.getHexagonalTemplate(),
            'serverless': this.getServerlessTemplate(),
            'cqrs': this.getCQRSTemplate(),
            'clean-architecture': this.getCleanArchitectureTemplate()
        };
        
        return templates[templateName] || null;
    }
    
    static getMicroservicesTemplate() {
        return {
            name: 'Microservices Architecture',
            description: 'A distributed architecture pattern with loosely coupled services',
            layers: [
                {
                    id: 'gateway',
                    name: 'API Gateway',
                    color: '#ef4444',
                    visible: true,
                    description: 'Entry point for all client requests'
                },
                {
                    id: 'services',
                    name: 'Microservices',
                    color: '#f59e0b',
                    visible: true,
                    description: 'Business logic services'
                },
                {
                    id: 'data',
                    name: 'Data Layer',
                    color: '#10b981',
                    visible: true,
                    description: 'Database and storage services'
                },
                {
                    id: 'infrastructure',
                    name: 'Infrastructure',
                    color: '#3b82f6',
                    visible: true,
                    description: 'Supporting infrastructure services'
                }
            ],
            nodes: [
                {
                    id: 'api-gateway',
                    x: 0,
                    y: -200,
                    label: 'API Gateway',
                    layer: 'gateway',
                    icon: 'fas fa-door-open',
                    type: 'gateway',
                    description: 'Routes requests to appropriate microservices',
                    code: `// API Gateway Configuration
const gateway = {
  port: 8080,
  routes: [
    { path: '/users/*', service: 'user-service' },
    { path: '/orders/*', service: 'order-service' },
    { path: '/payments/*', service: 'payment-service' }
  ],
  middleware: ['auth', 'rateLimit', 'logging']
};`,
                    codeLanguage: 'javascript'
                },
                {
                    id: 'user-service',
                    x: -200,
                    y: -50,
                    label: 'User Service',
                    layer: 'services',
                    icon: 'fas fa-users',
                    type: 'service',
                    description: 'Manages user accounts and authentication',
                    code: `@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        User user = userService.findById(id);
        return ResponseEntity.ok(user);
    }
    
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User savedUser = userService.save(user);
        return ResponseEntity.status(201).body(savedUser);
    }
}`,
                    codeLanguage: 'java'
                },
                {
                    id: 'order-service',
                    x: 0,
                    y: -50,
                    label: 'Order Service',
                    layer: 'services',
                    icon: 'fas fa-shopping-cart',
                    type: 'service',
                    description: 'Handles order processing and management',
                    code: `class OrderService:
    def __init__(self, db_connection, event_bus):
        self.db = db_connection
        self.event_bus = event_bus
    
    def create_order(self, order_data):
        order = Order(**order_data)
        order.id = self.db.save(order)
        
        # Publish order created event
        self.event_bus.publish('order.created', {
            'order_id': order.id,
            'user_id': order.user_id,
            'total': order.total
        })
        
        return order`,
                    codeLanguage: 'python'
                },
                {
                    id: 'payment-service',
                    x: 200,
                    y: -50,
                    label: 'Payment Service',
                    layer: 'services',
                    icon: 'fas fa-credit-card',
                    type: 'service',
                    description: 'Processes payments and transactions',
                    code: `package main

import (
    "github.com/gin-gonic/gin"
    "net/http"
)

type PaymentService struct {
    processor PaymentProcessor
    db        Database
}

func (ps *PaymentService) ProcessPayment(c *gin.Context) {
    var payment Payment
    if err := c.ShouldBindJSON(&payment); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    
    result, err := ps.processor.Process(payment)
    if err != nil {
        c.JSON(500, gin.H{"error": "Payment failed"})
        return
    }
    
    c.JSON(200, result)
}`,
                    codeLanguage: 'go'
                },
                {
                    id: 'user-db',
                    x: -200,
                    y: 100,
                    label: 'User Database',
                    layer: 'data',
                    icon: 'fas fa-database',
                    type: 'database',
                    description: 'Stores user information and profiles'
                },
                {
                    id: 'order-db',
                    x: 0,
                    y: 100,
                    label: 'Order Database',
                    layer: 'data',
                    icon: 'fas fa-database',
                    type: 'database',
                    description: 'Stores order data and history'
                },
                {
                    id: 'payment-db',
                    x: 200,
                    y: 100,
                    label: 'Payment Database',
                    layer: 'data',
                    icon: 'fas fa-database',
                    type: 'database',
                    description: 'Stores payment transactions'
                },
                {
                    id: 'message-queue',
                    x: -100,
                    y: 200,
                    label: 'Message Queue',
                    layer: 'infrastructure',
                    icon: 'fas fa-stream',
                    type: 'infrastructure',
                    description: 'Handles asynchronous communication'
                },
                {
                    id: 'cache',
                    x: 100,
                    y: 200,
                    label: 'Redis Cache',
                    layer: 'infrastructure',
                    icon: 'fas fa-memory',
                    type: 'infrastructure',
                    description: 'Caches frequently accessed data'
                }
            ],
            connections: [
                { from: 'api-gateway', to: 'user-service', label: 'HTTP/REST' },
                { from: 'api-gateway', to: 'order-service', label: 'HTTP/REST' },
                { from: 'api-gateway', to: 'payment-service', label: 'HTTP/REST' },
                { from: 'user-service', to: 'user-db', label: 'SQL' },
                { from: 'order-service', to: 'order-db', label: 'SQL' },
                { from: 'payment-service', to: 'payment-db', label: 'SQL' },
                { from: 'order-service', to: 'message-queue', label: 'Event' },
                { from: 'payment-service', to: 'message-queue', label: 'Event' },
                { from: 'user-service', to: 'cache', label: 'Cache' },
                { from: 'order-service', to: 'cache', label: 'Cache' }
            ]
        };
    }
    
    static getLayeredTemplate() {
        return {
            name: 'Layered Architecture',
            description: 'Traditional n-tier architecture with clear separation of concerns',
            layers: [
                {
                    id: 'presentation',
                    name: 'Presentation Layer',
                    color: '#ef4444',
                    visible: true,
                    description: 'User interface and presentation logic'
                },
                {
                    id: 'business',
                    name: 'Business Layer',
                    color: '#f59e0b',
                    visible: true,
                    description: 'Business logic and rules'
                },
                {
                    id: 'data',
                    name: 'Data Access Layer',
                    color: '#10b981',
                    visible: true,
                    description: 'Data access and persistence'
                },
                {
                    id: 'database',
                    name: 'Database Layer',
                    color: '#3b82f6',
                    visible: true,
                    description: 'Data storage and management'
                }
            ],
            nodes: [
                {
                    id: 'web-ui',
                    x: -100,
                    y: -150,
                    label: 'Web Interface',
                    layer: 'presentation',
                    icon: 'fas fa-desktop',
                    type: 'frontend'
                },
                {
                    id: 'mobile-ui',
                    x: 100,
                    y: -150,
                    label: 'Mobile App',
                    layer: 'presentation',
                    icon: 'fas fa-mobile-alt',
                    type: 'frontend'
                },
                {
                    id: 'controller',
                    x: 0,
                    y: -50,
                    label: 'Controller',
                    layer: 'business',
                    icon: 'fas fa-cog',
                    type: 'controller'
                },
                {
                    id: 'business-logic',
                    x: 0,
                    y: 50,
                    label: 'Business Logic',
                    layer: 'business',
                    icon: 'fas fa-brain',
                    type: 'service'
                },
                {
                    id: 'data-access',
                    x: 0,
                    y: 150,
                    label: 'Data Access Object',
                    layer: 'data',
                    icon: 'fas fa-exchange-alt',
                    type: 'dao'
                },
                {
                    id: 'database',
                    x: 0,
                    y: 250,
                    label: 'Database',
                    layer: 'database',
                    icon: 'fas fa-database',
                    type: 'database'
                }
            ],
            connections: [
                { from: 'web-ui', to: 'controller', label: 'HTTP' },
                { from: 'mobile-ui', to: 'controller', label: 'HTTP' },
                { from: 'controller', to: 'business-logic', label: 'Method Call' },
                { from: 'business-logic', to: 'data-access', label: 'Method Call' },
                { from: 'data-access', to: 'database', label: 'SQL' }
            ]
        };
    }
    
    static getEventDrivenTemplate() {
        return {
            name: 'Event-Driven Architecture',
            description: 'Architecture based on events and asynchronous communication',
            layers: [
                {
                    id: 'producers',
                    name: 'Event Producers',
                    color: '#ef4444',
                    visible: true,
                    description: 'Components that generate events'
                },
                {
                    id: 'brokers',
                    name: 'Event Brokers',
                    color: '#f59e0b',
                    visible: true,
                    description: 'Event routing and distribution'
                },
                {
                    id: 'consumers',
                    name: 'Event Consumers',
                    color: '#10b981',
                    visible: true,
                    description: 'Components that consume and process events'
                },
                {
                    id: 'storage',
                    name: 'Event Storage',
                    color: '#3b82f6',
                    visible: true,
                    description: 'Event persistence and history'
                }
            ],
            nodes: [
                {
                    id: 'user-service',
                    x: -150,
                    y: -100,
                    label: 'User Service',
                    layer: 'producers',
                    icon: 'fas fa-user',
                    type: 'producer'
                },
                {
                    id: 'order-service',
                    x: 0,
                    y: -100,
                    label: 'Order Service',
                    layer: 'producers',
                    icon: 'fas fa-shopping-cart',
                    type: 'producer'
                },
                {
                    id: 'payment-service',
                    x: 150,
                    y: -100,
                    label: 'Payment Service',
                    layer: 'producers',
                    icon: 'fas fa-credit-card',
                    type: 'producer'
                },
                {
                    id: 'event-bus',
                    x: 0,
                    y: 0,
                    label: 'Event Bus',
                    layer: 'brokers',
                    icon: 'fas fa-project-diagram',
                    type: 'broker'
                },
                {
                    id: 'notification-service',
                    x: -150,
                    y: 100,
                    label: 'Notification Service',
                    layer: 'consumers',
                    icon: 'fas fa-bell',
                    type: 'consumer'
                },
                {
                    id: 'analytics-service',
                    x: 0,
                    y: 100,
                    label: 'Analytics Service',
                    layer: 'consumers',
                    icon: 'fas fa-chart-line',
                    type: 'consumer'
                },
                {
                    id: 'audit-service',
                    x: 150,
                    y: 100,
                    label: 'Audit Service',
                    layer: 'consumers',
                    icon: 'fas fa-clipboard-list',
                    type: 'consumer'
                },
                {
                    id: 'event-store',
                    x: 0,
                    y: 200,
                    label: 'Event Store',
                    layer: 'storage',
                    icon: 'fas fa-archive',
                    type: 'storage'
                }
            ],
            connections: [
                { from: 'user-service', to: 'event-bus', label: 'UserEvents' },
                { from: 'order-service', to: 'event-bus', label: 'OrderEvents' },
                { from: 'payment-service', to: 'event-bus', label: 'PaymentEvents' },
                { from: 'event-bus', to: 'notification-service', label: 'Subscribe' },
                { from: 'event-bus', to: 'analytics-service', label: 'Subscribe' },
                { from: 'event-bus', to: 'audit-service', label: 'Subscribe' },
                { from: 'event-bus', to: 'event-store', label: 'Persist' }
            ]
        };
    }
    
    static getHexagonalTemplate() {
        return {
            name: 'Hexagonal Architecture',
            description: 'Ports and adapters architecture for clean separation',
            layers: [
                {
                    id: 'core',
                    name: 'Core Domain',
                    color: '#ef4444',
                    visible: true,
                    description: 'Business logic and domain models'
                },
                {
                    id: 'ports',
                    name: 'Ports',
                    color: '#f59e0b',
                    visible: true,
                    description: 'Interfaces for external communication'
                },
                {
                    id: 'adapters',
                    name: 'Adapters',
                    color: '#10b981',
                    visible: true,
                    description: 'External system implementations'
                }
            ],
            nodes: [
                {
                    id: 'domain-model',
                    x: 0,
                    y: 0,
                    label: 'Domain Model',
                    layer: 'core',
                    icon: 'fas fa-gem',
                    type: 'domain'
                },
                {
                    id: 'use-cases',
                    x: 0,
                    y: -80,
                    label: 'Use Cases',
                    layer: 'core',
                    icon: 'fas fa-tasks',
                    type: 'usecase'
                },
                {
                    id: 'web-port',
                    x: -120,
                    y: -150,
                    label: 'Web Port',
                    layer: 'ports',
                    icon: 'fas fa-plug',
                    type: 'port'
                },
                {
                    id: 'db-port',
                    x: 120,
                    y: 150,
                    label: 'Database Port',
                    layer: 'ports',
                    icon: 'fas fa-plug',
                    type: 'port'
                },
                {
                    id: 'rest-adapter',
                    x: -200,
                    y: -200,
                    label: 'REST Adapter',
                    layer: 'adapters',
                    icon: 'fas fa-network-wired',
                    type: 'adapter'
                },
                {
                    id: 'db-adapter',
                    x: 200,
                    y: 200,
                    label: 'DB Adapter',
                    layer: 'adapters',
                    icon: 'fas fa-database',
                    type: 'adapter'
                }
            ],
            connections: [
                { from: 'rest-adapter', to: 'web-port', label: 'HTTP' },
                { from: 'web-port', to: 'use-cases', label: 'Interface' },
                { from: 'use-cases', to: 'domain-model', label: 'Domain Logic' },
                { from: 'use-cases', to: 'db-port', label: 'Interface' },
                { from: 'db-port', to: 'db-adapter', label: 'Implementation' }
            ]
        };
    }
    
    static getAllTemplates() {
        return {
            microservices: this.getMicroservicesTemplate(),
            layered: this.getLayeredTemplate(),
            'event-driven': this.getEventDrivenTemplate(),
            hexagonal: this.getHexagonalTemplate(),
            serverless: this.getServerlessTemplate(),
            cqrs: this.getCQRSTemplate(),
            'clean-architecture': this.getCleanArchitectureTemplate()
        };
    }
    
    static getServerlessTemplate() {
        return {
            name: 'Serverless Architecture',
            description: 'Event-driven serverless functions with managed services',
            layers: [
                {
                    id: 'client',
                    name: 'Client Layer',
                    color: '#ef4444',
                    visible: true,
                    description: 'Client applications and CDN'
                },
                {
                    id: 'api',
                    name: 'API Gateway',
                    color: '#f59e0b',
                    visible: true,
                    description: 'API management and routing'
                },
                {
                    id: 'functions',
                    name: 'Function Layer',
                    color: '#10b981',
                    visible: true,
                    description: 'Serverless compute functions'
                },
                {
                    id: 'storage',
                    name: 'Storage Layer',
                    color: '#3b82f6',
                    visible: true,
                    description: 'Databases and file storage'
                },
                {
                    id: 'monitoring',
                    name: 'Monitoring',
                    color: '#8b5cf6',
                    visible: true,
                    description: 'Logging and monitoring services'
                }
            ],
            nodes: [
                {
                    id: 'web-app',
                    x: -200,
                    y: -200,
                    label: 'React SPA',
                    layer: 'client',
                    icon: 'fab fa-react',
                    type: 'frontend',
                    description: 'Single Page Application built with React',
                    code: `import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <h1>User Dashboard</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <UserList users={users} />
      )}
    </div>
  );
};

export default UserDashboard;`,
                    codeLanguage: 'javascript'
                },
                {
                    id: 'mobile-app',
                    x: 0,
                    y: -200,
                    label: 'Flutter App',
                    layer: 'client',
                    icon: 'fas fa-mobile-alt',
                    type: 'mobile',
                    description: 'Cross-platform mobile application',
                    code: `import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class UserService {
  static const String baseUrl = 'https://api.example.com';
  
  static Future<List<User>> fetchUsers() async {
    final response = await http.get(
      Uri.parse('$baseUrl/users'),
      headers: {'Content-Type': 'application/json'},
    );
    
    if (response.statusCode == 200) {
      List<dynamic> data = json.decode(response.body);
      return data.map((json) => User.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load users');
    }
  }
  
  static Future<User> createUser(User user) async {
    final response = await http.post(
      Uri.parse('$baseUrl/users'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode(user.toJson()),
    );
    
    if (response.statusCode == 201) {
      return User.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to create user');
    }
  }
}`,
                    codeLanguage: 'dart'
                },
                {
                    id: 'cdn',
                    x: 200,
                    y: -200,
                    label: 'CloudFront CDN',
                    layer: 'client',
                    icon: 'fas fa-cloud',
                    type: 'cdn',
                    description: 'Content delivery network for static assets'
                },
                {
                    id: 'api-gateway',
                    x: 0,
                    y: -100,
                    label: 'API Gateway',
                    layer: 'api',
                    icon: 'fas fa-door-open',
                    type: 'gateway',
                    description: 'AWS API Gateway for serverless APIs',
                    code: `# serverless.yml
service: user-api

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    USERS_TABLE: \${self:service}-users-\${self:provider.stage}

functions:
  getUsers:
    handler: handlers/users.getUsers
    events:
      - http:
          path: /users
          method: get
          cors: true
          authorizer: aws_iam

  createUser:
    handler: handlers/users.createUser
    events:
      - http:
          path: /users
          method: post
          cors: true
          authorizer: aws_iam

  getUserById:
    handler: handlers/users.getUserById
    events:
      - http:
          path: /users/{id}
          method: get
          cors: true
          authorizer: aws_iam

resources:
  Resources:
    UsersTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: \${self:provider.environment.USERS_TABLE}
        AttributeDefinitions:
          - AttributeName: id
            AttributeType: S
        KeySchema:
          - AttributeName: id
            KeyType: HASH`,
                    codeLanguage: 'yaml'
                },
                {
                    id: 'auth-lambda',
                    x: -150,
                    y: 0,
                    label: 'Auth Lambda',
                    layer: 'functions',
                    icon: 'fas fa-shield-alt',
                    type: 'function',
                    description: 'Authentication and authorization function',
                    code: `const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');

const cognito = new AWS.CognitoIdentityServiceProvider();

exports.handler = async (event) => {
  try {
    const token = event.authorizationToken;
    
    if (!token) {
      throw new Error('No token provided');
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    
    // Get user details from Cognito
    const userParams = {
      UserPoolId: process.env.USER_POOL_ID,
      Username: decoded.sub
    };
    
    const userData = await cognito.adminGetUser(userParams).promise();
    
    return {
      principalId: decoded.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: event.methodArn
          }
        ]
      },
      context: {
        userId: decoded.sub,
        email: userData.UserAttributes.find(attr => attr.Name === 'email').Value
      }
    };
  } catch (error) {
    console.error('Authorization failed:', error);
    throw new Error('Unauthorized');
  }
};`,
                    codeLanguage: 'javascript'
                },
                {
                    id: 'users-lambda',
                    x: 0,
                    y: 50,
                    label: 'Users Lambda',
                    layer: 'functions',
                    icon: 'fas fa-users',
                    type: 'function',
                    description: 'User management functions',
                    code: `const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.USERS_TABLE;

exports.getUsers = async (event) => {
  try {
    const params = {
      TableName: TABLE_NAME,
      Limit: parseInt(event.queryStringParameters?.limit) || 20,
      ExclusiveStartKey: event.queryStringParameters?.lastKey ? 
        JSON.parse(decodeURIComponent(event.queryStringParameters.lastKey)) : undefined
    };

    const result = await dynamodb.scan(params).promise();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        users: result.Items,
        lastKey: result.LastEvaluatedKey ? 
          encodeURIComponent(JSON.stringify(result.LastEvaluatedKey)) : null
      })
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch users' })
    };
  }
};

exports.createUser = async (event) => {
  try {
    const userData = JSON.parse(event.body);
    const user = {
      id: uuidv4(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await dynamodb.put({
      TableName: TABLE_NAME,
      Item: user
    }).promise();

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(user)
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create user' })
    };
  }
};`,
                    codeLanguage: 'javascript'
                },
                {
                    id: 'orders-lambda',
                    x: 150,
                    y: 0,
                    label: 'Orders Lambda',
                    layer: 'functions',
                    icon: 'fas fa-shopping-cart',
                    type: 'function',
                    description: 'Order processing functions',
                    code: `import json
import boto3
import uuid
from datetime import datetime
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')
table = dynamodb.Table(os.environ['ORDERS_TABLE'])

def create_order(event, context):
    try:
        order_data = json.loads(event['body'])
        
        order = {
            'id': str(uuid.uuid4()),
            'userId': order_data['userId'],
            'items': order_data['items'],
            'total': Decimal(str(order_data['total'])),
            'status': 'pending',
            'createdAt': datetime.utcnow().isoformat(),
            'updatedAt': datetime.utcnow().isoformat()
        }
        
        # Save to DynamoDB
        table.put_item(Item=order)
        
        # Publish order created event
        message = {
            'orderId': order['id'],
            'userId': order['userId'],
            'total': float(order['total']),
            'status': order['status']
        }
        
        sns.publish(
            TopicArn=os.environ['ORDER_EVENTS_TOPIC'],
            Message=json.dumps(message),
            Subject='Order Created'
        )
        
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(order, default=str)
        }
        
    except Exception as e:
        print(f"Error creating order: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Failed to create order'})
        }`,
                    codeLanguage: 'python'
                },
                {
                    id: 'dynamodb',
                    x: -100,
                    y: 150,
                    label: 'DynamoDB',
                    layer: 'storage',
                    icon: 'fas fa-database',
                    type: 'database',
                    description: 'NoSQL database for user and order data'
                },
                {
                    id: 's3',
                    x: 100,
                    y: 150,
                    label: 'S3 Storage',
                    layer: 'storage',
                    icon: 'fas fa-cloud',
                    type: 'storage',
                    description: 'Object storage for files and static assets'
                },
                {
                    id: 'cloudwatch',
                    x: 0,
                    y: 200,
                    label: 'CloudWatch',
                    layer: 'monitoring',
                    icon: 'fas fa-chart-line',
                    type: 'monitoring',
                    description: 'Monitoring and logging service'
                }
            ],
            connections: [
                { from: 'web-app', to: 'api-gateway', label: 'HTTPS' },
                { from: 'mobile-app', to: 'api-gateway', label: 'HTTPS' },
                { from: 'web-app', to: 'cdn', label: 'Static Assets' },
                { from: 'api-gateway', to: 'auth-lambda', label: 'Invoke' },
                { from: 'api-gateway', to: 'users-lambda', label: 'Invoke' },
                { from: 'api-gateway', to: 'orders-lambda', label: 'Invoke' },
                { from: 'users-lambda', to: 'dynamodb', label: 'Read/Write' },
                { from: 'orders-lambda', to: 'dynamodb', label: 'Read/Write' },
                { from: 'orders-lambda', to: 's3', label: 'Store Files' },
                { from: 'auth-lambda', to: 'cloudwatch', label: 'Logs' },
                { from: 'users-lambda', to: 'cloudwatch', label: 'Logs' },
                { from: 'orders-lambda', to: 'cloudwatch', label: 'Logs' }
            ]
        };
    }
    
    static getCQRSTemplate() {
        return {
            name: 'CQRS Architecture',
            description: 'Command Query Responsibility Segregation with Event Sourcing',
            layers: [
                {
                    id: 'presentation',
                    name: 'Presentation',
                    color: '#ef4444',
                    visible: true,
                    description: 'User interfaces and API endpoints'
                },
                {
                    id: 'commands',
                    name: 'Command Side',
                    color: '#f59e0b',
                    visible: true,
                    description: 'Write operations and business logic'
                },
                {
                    id: 'events',
                    name: 'Event Store',
                    color: '#10b981',
                    visible: true,
                    description: 'Event sourcing and message bus'
                },
                {
                    id: 'queries',
                    name: 'Query Side',
                    color: '#3b82f6',
                    visible: true,
                    description: 'Read models and projections'
                }
            ],
            nodes: [
                {
                    id: 'web-ui',
                    x: -150,
                    y: -150,
                    label: 'Web Interface',
                    layer: 'presentation',
                    icon: 'fas fa-desktop',
                    type: 'frontend',
                    description: 'React-based web application'
                },
                {
                    id: 'api',
                    x: 150,
                    y: -150,
                    label: 'REST API',
                    layer: 'presentation',
                    icon: 'fas fa-network-wired',
                    type: 'api',
                    description: 'RESTful API for external clients'
                },
                {
                    id: 'command-handler',
                    x: -150,
                    y: -50,
                    label: 'Command Handler',
                    layer: 'commands',
                    icon: 'fas fa-cog',
                    type: 'handler',
                    description: 'Processes commands and enforces business rules',
                    code: `public class CreateUserCommandHandler : ICommandHandler<CreateUserCommand>
{
    private readonly IUserRepository _userRepository;
    private readonly IEventBus _eventBus;

    public CreateUserCommandHandler(IUserRepository userRepository, IEventBus eventBus)
    {
        _userRepository = userRepository;
        _eventBus = eventBus;
    }

    public async Task<Result> Handle(CreateUserCommand command)
    {
        try
        {
            // Validate command
            if (string.IsNullOrEmpty(command.Email))
                return Result.Failure("Email is required");

            // Check if user exists
            var existingUser = await _userRepository.GetByEmailAsync(command.Email);
            if (existingUser != null)
                return Result.Failure("User already exists");

            // Create user aggregate
            var user = User.Create(command.Email, command.Name);
            
            // Save user
            await _userRepository.SaveAsync(user);

            // Publish domain events
            foreach (var domainEvent in user.GetUncommittedEvents())
            {
                await _eventBus.PublishAsync(domainEvent);
            }

            user.MarkEventsAsCommitted();

            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to create user: {ex.Message}");
        }
    }
}`,
                    codeLanguage: 'csharp'
                },
                {
                    id: 'aggregate',
                    x: 0,
                    y: -50,
                    label: 'User Aggregate',
                    layer: 'commands',
                    icon: 'fas fa-cube',
                    type: 'aggregate',
                    description: 'Domain aggregate root with business logic',
                    code: `public class User : AggregateRoot
{
    public UserId Id { get; private set; }
    public string Email { get; private set; }
    public string Name { get; private set; }
    public UserStatus Status { get; private set; }

    private User() { } // For EF

    public static User Create(string email, string name)
    {
        var user = new User
        {
            Id = UserId.NewId(),
            Email = email,
            Name = name,
            Status = UserStatus.Active
        };

        user.AddDomainEvent(new UserCreatedEvent(user.Id, email, name));
        return user;
    }

    public void ChangeEmail(string newEmail)
    {
        if (string.IsNullOrEmpty(newEmail))
            throw new ArgumentException("Email cannot be empty");

        if (Email == newEmail)
            return;

        var oldEmail = Email;
        Email = newEmail;

        AddDomainEvent(new UserEmailChangedEvent(Id, oldEmail, newEmail));
    }

    public void Deactivate()
    {
        if (Status == UserStatus.Inactive)
            return;

        Status = UserStatus.Inactive;
        AddDomainEvent(new UserDeactivatedEvent(Id));
    }
}`,
                    codeLanguage: 'csharp'
                },
                {
                    id: 'event-store',
                    x: 0,
                    y: 50,
                    label: 'Event Store',
                    layer: 'events',
                    icon: 'fas fa-archive',
                    type: 'eventstore',
                    description: 'Immutable event storage and sourcing',
                    code: `public class EventStore : IEventStore
{
    private readonly IDbContext _context;
    private readonly IEventSerializer _serializer;

    public async Task SaveEventsAsync(string aggregateId, IEnumerable<IDomainEvent> events, int expectedVersion)
    {
        var eventRecords = events.Select((e, index) => new EventRecord
        {
            Id = Guid.NewGuid(),
            AggregateId = aggregateId,
            EventType = e.GetType().Name,
            EventData = _serializer.Serialize(e),
            Version = expectedVersion + index + 1,
            Timestamp = DateTime.UtcNow
        }).ToList();

        await _context.Events.AddRangeAsync(eventRecords);
        await _context.SaveChangesAsync();

        // Publish events to message bus
        foreach (var evt in events)
        {
            await _messageBus.PublishAsync(evt);
        }
    }

    public async Task<IEnumerable<IDomainEvent>> GetEventsAsync(string aggregateId)
    {
        var eventRecords = await _context.Events
            .Where(e => e.AggregateId == aggregateId)
            .OrderBy(e => e.Version)
            .ToListAsync();

        return eventRecords.Select(record => 
            _serializer.Deserialize(record.EventData, record.EventType));
    }
}`,
                    codeLanguage: 'csharp'
                },
                {
                    id: 'message-bus',
                    x: 150,
                    y: 50,
                    label: 'Message Bus',
                    layer: 'events',
                    icon: 'fas fa-exchange-alt',
                    type: 'messagebus',
                    description: 'Event distribution and routing'
                },
                {
                    id: 'read-model',
                    x: -150,
                    y: 150,
                    label: 'Read Models',
                    layer: 'queries',
                    icon: 'fas fa-eye',
                    type: 'readmodel',
                    description: 'Optimized query models and projections',
                    code: `public class UserReadModel
{
    public string Id { get; set; }
    public string Email { get; set; }
    public string Name { get; set; }
    public string Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastModified { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalSpent { get; set; }
}

public class UserProjectionHandler : 
    IEventHandler<UserCreatedEvent>,
    IEventHandler<UserEmailChangedEvent>,
    IEventHandler<UserDeactivatedEvent>
{
    private readonly IReadModelRepository<UserReadModel> _repository;

    public async Task Handle(UserCreatedEvent @event)
    {
        var readModel = new UserReadModel
        {
            Id = @event.UserId.ToString(),
            Email = @event.Email,
            Name = @event.Name,
            Status = "Active",
            CreatedAt = @event.Timestamp,
            LastModified = @event.Timestamp,
            TotalOrders = 0,
            TotalSpent = 0
        };

        await _repository.UpsertAsync(readModel);
    }

    public async Task Handle(UserEmailChangedEvent @event)
    {
        var readModel = await _repository.GetByIdAsync(@event.UserId.ToString());
        if (readModel != null)
        {
            readModel.Email = @event.NewEmail;
            readModel.LastModified = @event.Timestamp;
            await _repository.UpsertAsync(readModel);
        }
    }
}`,
                    codeLanguage: 'csharp'
                },
                {
                    id: 'query-handler',
                    x: 0,
                    y: 150,
                    label: 'Query Handler',
                    layer: 'queries',
                    icon: 'fas fa-search',
                    type: 'handler',
                    description: 'Handles read queries efficiently'
                },
                {
                    id: 'read-db',
                    x: 150,
                    y: 150,
                    label: 'Read Database',
                    layer: 'queries',
                    icon: 'fas fa-database',
                    type: 'database',
                    description: 'Optimized database for read operations'
                }
            ],
            connections: [
                { from: 'web-ui', to: 'command-handler', label: 'Commands' },
                { from: 'api', to: 'command-handler', label: 'Commands' },
                { from: 'web-ui', to: 'query-handler', label: 'Queries' },
                { from: 'api', to: 'query-handler', label: 'Queries' },
                { from: 'command-handler', to: 'aggregate', label: 'Load/Save' },
                { from: 'aggregate', to: 'event-store', label: 'Events' },
                { from: 'event-store', to: 'message-bus', label: 'Publish' },
                { from: 'message-bus', to: 'read-model', label: 'Project' },
                { from: 'query-handler', to: 'read-model', label: 'Query' },
                { from: 'read-model', to: 'read-db', label: 'Read/Write' }
            ]
        };
    }
    
    static getCleanArchitectureTemplate() {
        return {
            name: 'Clean Architecture',
            description: 'Uncle Bob\'s Clean Architecture with dependency inversion',
            layers: [
                {
                    id: 'frameworks',
                    name: 'Frameworks & Drivers',
                    color: '#ef4444',
                    visible: true,
                    description: 'External frameworks, databases, and web'
                },
                {
                    id: 'adapters',
                    name: 'Interface Adapters',
                    color: '#f59e0b',
                    visible: true,
                    description: 'Controllers, presenters, and gateways'
                },
                {
                    id: 'usecases',
                    name: 'Use Cases',
                    color: '#10b981',
                    visible: true,
                    description: 'Application business rules'
                },
                {
                    id: 'entities',
                    name: 'Entities',
                    color: '#3b82f6',
                    visible: true,
                    description: 'Enterprise business rules'
                }
            ],
            nodes: [
                {
                    id: 'web-framework',
                    x: -200,
                    y: -200,
                    label: 'Express.js',
                    layer: 'frameworks',
                    icon: 'fab fa-node-js',
                    type: 'framework',
                    description: 'Web framework for HTTP handling'
                },
                {
                    id: 'database',
                    x: 0,
                    y: -200,
                    label: 'PostgreSQL',
                    layer: 'frameworks',
                    icon: 'fas fa-database',
                    type: 'database',
                    description: 'Relational database'
                },
                {
                    id: 'external-api',
                    x: 200,
                    y: -200,
                    label: 'Payment API',
                    layer: 'frameworks',
                    icon: 'fas fa-credit-card',
                    type: 'external',
                    description: 'External payment service'
                },
                {
                    id: 'controller',
                    x: -200,
                    y: -100,
                    label: 'User Controller',
                    layer: 'adapters',
                    icon: 'fas fa-cog',
                    type: 'controller',
                    description: 'HTTP request/response handling',
                    code: `class UserController {
  constructor(getUserUseCase, createUserUseCase, deleteUserUseCase) {
    this.getUserUseCase = getUserUseCase;
    this.createUserUseCase = createUserUseCase;
    this.deleteUserUseCase = deleteUserUseCase;
  }

  async getUser(req, res) {
    try {
      const { userId } = req.params;
      const user = await this.getUserUseCase.execute({ userId });
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async createUser(req, res) {
    try {
      const userData = req.body;
      const user = await this.createUserUseCase.execute(userData);
      
      res.status(201).json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async deleteUser(req, res) {
    try {
      const { userId } = req.params;
      await this.deleteUserUseCase.execute({ userId });
      
      res.status(204).send();
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = UserController;`,
                    codeLanguage: 'javascript'
                },
                {
                    id: 'presenter',
                    x: -100,
                    y: -100,
                    label: 'User Presenter',
                    layer: 'adapters',
                    icon: 'fas fa-eye',
                    type: 'presenter',
                    description: 'Data formatting for presentation'
                },
                {
                    id: 'repository',
                    x: 0,
                    y: -100,
                    label: 'User Repository',
                    layer: 'adapters',
                    icon: 'fas fa-archive',
                    type: 'repository',
                    description: 'Data access abstraction',
                    code: `class UserRepository {
  constructor(database) {
    this.db = database;
  }

  async findById(id) {
    const result = await this.db.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const userData = result.rows[0];
    return new User({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at
    });
  }

  async save(user) {
    const isUpdate = user.id !== null;
    
    if (isUpdate) {
      await this.db.query(
        'UPDATE users SET email = $1, name = $2, updated_at = $3 WHERE id = $4',
        [user.email, user.name, new Date(), user.id]
      );
    } else {
      const result = await this.db.query(
        'INSERT INTO users (email, name, created_at, updated_at) VALUES ($1, $2, $3, $4) RETURNING id',
        [user.email, user.name, new Date(), new Date()]
      );
      user.id = result.rows[0].id;
    }
    
    return user;
  }

  async delete(id) {
    await this.db.query('DELETE FROM users WHERE id = $1', [id]);
  }

  async findByEmail(email) {
    const result = await this.db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    return result.rows.length > 0 ? this.mapRowToUser(result.rows[0]) : null;
  }
}`,
                    codeLanguage: 'javascript'
                },
                {
                    id: 'gateway',
                    x: 200,
                    y: -100,
                    label: 'Payment Gateway',
                    layer: 'adapters',
                    icon: 'fas fa-exchange-alt',
                    type: 'gateway',
                    description: 'External service integration'
                },
                {
                    id: 'get-user-usecase',
                    x: -150,
                    y: 0,
                    label: 'Get User Use Case',
                    layer: 'usecases',
                    icon: 'fas fa-play',
                    type: 'usecase',
                    description: 'Business logic for retrieving users',
                    code: `class GetUserUseCase {
  constructor(userRepository, authService) {
    this.userRepository = userRepository;
    this.authService = authService;
  }

  async execute(request) {
    // Validate input
    if (!request.userId) {
      throw new Error('User ID is required');
    }

    // Check authorization (use case responsibility)
    if (!await this.authService.canAccessUser(request.requestingUserId, request.userId)) {
      throw new Error('Unauthorized access to user data');
    }

    // Business rule: fetch user
    const user = await this.userRepository.findById(request.userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Business rule: don't return deleted users
    if (user.isDeleted()) {
      throw new Error('User not found');
    }

    // Return user data
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      profile: user.getPublicProfile()
    };
  }
}

module.exports = GetUserUseCase;`,
                    codeLanguage: 'javascript'
                },
                {
                    id: 'create-user-usecase',
                    x: 0,
                    y: 0,
                    label: 'Create User Use Case',
                    layer: 'usecases',
                    icon: 'fas fa-plus',
                    type: 'usecase',
                    description: 'Business logic for user creation'
                },
                {
                    id: 'delete-user-usecase',
                    x: 150,
                    y: 0,
                    label: 'Delete User Use Case',
                    layer: 'usecases',
                    icon: 'fas fa-trash',
                    type: 'usecase',
                    description: 'Business logic for user deletion'
                },
                {
                    id: 'user-entity',
                    x: -75,
                    y: 100,
                    label: 'User Entity',
                    layer: 'entities',
                    icon: 'fas fa-user',
                    type: 'entity',
                    description: 'Core business entity with enterprise rules',
                    code: `class User {
  constructor({ id = null, email, name, status = 'active', createdAt = null, updatedAt = null }) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.status = status;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
    
    // Validate entity invariants
    this.validate();
  }

  validate() {
    if (!this.email || !this.isValidEmail(this.email)) {
      throw new Error('Valid email is required');
    }
    
    if (!this.name || this.name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters');
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Enterprise business rules
  canBeDeleted() {
    // Business rule: Users with active orders cannot be deleted
    return this.status !== 'has_active_orders';
  }

  isDeleted() {
    return this.status === 'deleted';
  }

  getPublicProfile() {
    return {
      name: this.name,
      joinDate: this.createdAt,
      isActive: this.status === 'active'
    };
  }

  updateEmail(newEmail) {
    if (!this.isValidEmail(newEmail)) {
      throw new Error('Invalid email format');
    }
    
    this.email = newEmail;
    this.updatedAt = new Date();
  }

  deactivate() {
    if (this.status === 'deleted') {
      throw new Error('Cannot deactivate deleted user');
    }
    
    this.status = 'inactive';
    this.updatedAt = new Date();
  }

  markAsDeleted() {
    if (!this.canBeDeleted()) {
      throw new Error('User cannot be deleted at this time');
    }
    
    this.status = 'deleted';
    this.updatedAt = new Date();
  }
}

module.exports = User;`,
                    codeLanguage: 'javascript'
                },
                {
                    id: 'business-rules',
                    x: 75,
                    y: 100,
                    label: 'Business Rules',
                    layer: 'entities',
                    icon: 'fas fa-gavel',
                    type: 'rules',
                    description: 'Core enterprise business rules'
                }
            ],
            connections: [
                { from: 'web-framework', to: 'controller', label: 'HTTP' },
                { from: 'controller', to: 'get-user-usecase', label: 'Execute' },
                { from: 'controller', to: 'create-user-usecase', label: 'Execute' },
                { from: 'controller', to: 'delete-user-usecase', label: 'Execute' },
                { from: 'controller', to: 'presenter', label: 'Format' },
                { from: 'get-user-usecase', to: 'repository', label: 'Query' },
                { from: 'create-user-usecase', to: 'repository', label: 'Save' },
                { from: 'delete-user-usecase', to: 'repository', label: 'Delete' },
                { from: 'repository', to: 'database', label: 'SQL' },
                { from: 'gateway', to: 'external-api', label: 'HTTP' },
                { from: 'get-user-usecase', to: 'user-entity', label: 'Create' },
                { from: 'create-user-usecase', to: 'user-entity', label: 'Create' },
                { from: 'delete-user-usecase', to: 'user-entity', label: 'Load' },
                { from: 'user-entity', to: 'business-rules', label: 'Enforce' }
            ]
        };
    }
}

// Export for use in other modules
window.ArchitectureData = ArchitectureData;